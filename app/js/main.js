$(function(){

    /**
     * Templates utilizados pra criar os itens e pra seção de pre-checkin (que é a área que envolve o botão de check-in/out e a listagem dos projetos)
     * @type {Function}
     */
    var registroItemTemplate = _.template($("#registros-item-template").html());
    var preCheckinTemplate = _.template($("#pre-checkin-template").html());


    /**
     * Retorna o tempo passado entre duas datas
     * @param  {Date} start date
     * @param  {Date} end   date
     * @return {String}       hora formatada hh:mm
     */
    var passedHours = function(start, end){
        var diff = (start.getTime() - end.getTime()) / 1000 / 60,
            mins = Math.round(diff%60),
            hours = Math.floor(diff/60);

        return formatTime(hours) + ':' + formatTime(mins)
    }


    /**
     * Normaliza a hora pra sempre ter 2 dígitos
     * @param  {Int} date hora ou minito
     * @return {String}      hora formatada hh
     */
    var formatTime = function(date){
        return (date < 10) ? '0'+date : date;
    }

    /**
     * Model de cada registro
     * @type {Backbone.Model}
     */
    var registroModel = Backbone.Model.extend({
        defaults: {
            dia: false,
            checkin: false,
            checkout: false,
            horas: false,
            projeto: ''
        }
    })

    /**
     * Collection de registros, ela ja é automaticamente instanciada
     * @type {Backbone.Collection}
     */
    var registros = new (Backbone.Collection.extend({
        model: registroModel,
        url: 'registros',

        /**
         * Comparador de ordenação dos itens da collection
         * @default -1
         * @return {Int}
         */
        comparator: function(){
            return 1;
        }
    }))


    /**
     * View de CADA item da listagem de itens
     * @type {Backbone.View}
     */
    var registroView = Backbone.View.extend({
        tagName: 'tr',
        initialize: function(){
            this.template = registroItemTemplate
            this.model = this.options.model;

            this.model.on('change', this.render, this);
        },

        render: function(){
            var data = this.model.toJSON();

            if(!data.checkin) return this; //Item novo

            data.horas = (data.horas) ? data.horas : passedHours(new Date(), new Date(data.checkin));
            data.checkin = formatTime(new Date(data.checkin).getHours()) + ':' + formatTime(new Date(data.checkin).getMinutes())
            data.checkout = (data.checkout) ? formatTime(new Date(data.checkout).getHours()) + ':' + formatTime(new Date(data.checkout).getMinutes()) : '';


            this.$el.html(this.template(data));
            return this;
        }
    })


    /**
     * View da coleção de registros. Pra cada registro ela instancia uma nova view de registro que recebe uma model
     * @type {Backbone.View}
     */
    var registrosView = Backbone.View.extend({
        id: 'registros',
        tagName: 'tbody',
        initialize: function(){
            this.collection = this.options.collection;
            this.collection.on('add', this.add, this)
            this.collection.on('reset', this.render, this)

            return this;
        },

        add: function(model){
            this.$el.prepend(new registroView({model: model}).render().el)
        },

        render: function(){

            this.collection.each(function(model){
                this.$el.append(new registroView({model: model}).render().el)
            }, this)

            return this;
        }
    })


    /**
     * Troca os registros pela view de registros, mas essa view só vai ter conteúdo depois que finalizar o fetch
     * @type {[type]}
     */
    $('#registros').replaceWith(new registrosView({collection: registros}).el)




    /**
     * Model de CADA projeto
     * @type {Backbone.Model}
     */
    var projetoModel = Backbone.Model.extend({
        defaults: {
            name: '',
            status: 0
        }
    })


    /**
     * Collection de projetos
     * @type {Backbone.Collection}
     */
    var projetos = new (Backbone.Collection.extend({
        model: projetoModel,
        url: 'projetos'
    }))()




    /**
     * Faz um fetch dos registros, pegando o que tem no localstorage
     */
    $.when(registros.fetch(), projetos.fetch()).then(function(){

        /**
         * Esse objeto trata os eventos dos novos check-ins, pra não ter que ficar re-declarando os eventos da model de check-in toda vez que ela é "clonada"
         * @type {Backbone.Events}
         */
        var checkinEmitter = _.extend({}, Backbone.Events);

        /**
         * Cria um novo registro vazio baseado no último criado
         * @return {Backbone.Model} nova model pronta pra ser salva baseada nos eventos da checkinEmitter
         */
        var newCheckinModel = function(){
            var model = new registroModel();

            if(registros.length){
                model.set({projeto: registros.first().get('projeto')});
            }

            registros.add(model);
            model.save();

            return model;
        }


        //usa o ultimo registro caso ele exista
        if(registros.length && !registros.first().get('checkout')){
            var checkinModel = registros.first()
        } else { //se não cria um novo
            var checkinModel = newCheckinModel();
        }

        checkinEmitter.on('save', function(){
            checkinModel.save();
        });



        /**
         * View do pre-checkin, que é a area com os botões de check-in e check-out
         * @type {Backbone.View}
         */
        var preCheckinView = new (Backbone.View.extend({

            events: {
                'click #check' : 'check',
                'click .dropdown-menu a' : 'changeProject'
            },

            initialize: function(){
                this.template = preCheckinTemplate;

                checkinEmitter.on('save', this.render, this);

            },

            changeProject: function(e){
                e.preventDefault();

                checkinModel.set('projeto', $(e.target).text())
                checkinEmitter.trigger('save');
            },

            check: function(){

                var now = new Date(),
                    started;

                if(checkinModel.get('checkin')){//faz check-out

                    started = checkinModel.get('checkin');

                    checkinModel.set({
                        checkout: now,
                        horas: passedHours(now, new Date(started))
                    })
                    checkinModel.save();

                    checkinModel = newCheckinModel();
                    checkinEmitter.trigger('save');


                } else {//faz check-in

                    checkinModel.set({
                        checkin: now,
                        checkout: false,
                        horas: false,
                        dia: now.getDate() + '/' + now.getMonth()
                    })

                    checkinEmitter.trigger('save');

                    return false;

                }

                return false;
            },

            render: function(){

                this.$el.html(this.template({projetos: projetos.toJSON(), checkin: checkinModel.toJSON()}))

                if(checkinModel.get('checkin')){
                    this.$el.removeClass('btn-group');
                } else {
                    this.$el.addClass('btn-group');
                }
            }
        }))

        preCheckinView.setElement('#pre-checkin');
        preCheckinView.render();


    })

})


var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-2247200-11']);
    _gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
