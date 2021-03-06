scheduler = function(){
    dataSource =
    {
        dataType: 'array',
        dataFields: [
            { name: 'id', type: 'string' },
            { name: 'dbid', type: 'string' },
            { name: 'status', type: 'string' },
            { name: 'background', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'location', type: 'string' },
            { name: 'subject', type: 'string' },
            { name: 'style', type: 'string' },
            { name: 'calendar', type: 'string' },
            { name: 'recurrenceRule', type: 'string' },
            { name: 'recurrenceException', type: 'string' },
            { name: 'start', type: 'date', format: "yyyy-MM-dd HH:mm" },
            { name: 'end', type: 'date', format: "yyyy-MM-dd HH:mm" },
        ],
        id: 'id'
    };
    /**
     * We need this source because we want the resources
     * to be independent from the existing appoinments
     */
    resourceSource =
    {
        dataType: 'array',
        dataFields: [
            { name: 'calendar', type: 'string' }
        ],
        id: 'calendar',
        localdata: resources
    };
    /**
     * Create an adapter from the source to
     * bind the scheduler data
     */
    dataAdapter = new $.jqx.dataAdapter(dataSource);
    resourceAdapter = new $.jqx.dataAdapter(resourceSource);
    /**
     * Create the scheduler
     */
    $("#scheduler").jqxScheduler({
        width: '100%',
        height: '100%',
        rowsHeight:30,
        source: dataAdapter,
        showLegend: false,
        ready: function () { registerEvents(dataAdapter) },
        appointmentDataFields:
        {
            from: "start",
            to: "end",
            id: "id",
            background: "background",
            resourceId: "calendar",
            description: "description",
            location: "location",
            subject: "subject",
            style: "style",
            status: "status",
            recurrencePattern: "recurrenceRule",
            recurrenceException: "recurrenceException"
        },
        resources:
        {
            //colorScheme: "scheme05",
            dataField: "calendar",
            //orientation:"horizontal",
            source:  resourceAdapter
        },
        view: 'monthView',
        views:
            [
                {type:'dayView'},
                {
                    type:'weekView',
                    workTime: {
                        fromDayOfWeek: 1,
                        toDayOfWeek: 5,
                        fromHour: 7,
                        toHour: 15
                    },
                    //showWeekends: false
                },
                {
                    type:'monthView',
                    //showWeekends: false,
                }
                //'agendaView'
            ],
        theme:theme,
        editDialogCreate: function (dialog, fields, editAppointment) {
            /**
             * Hide timezone and color options
             */
            fields.timeZoneContainer.hide();
            fields.colorContainer.hide();
        },
        localization : greekLanguage,
        renderAppointment: function(data){
            data.html = data.appointment.resourceId + " - " + data.appointment.subject;
            return data;
        },
        /**
         * called when the context menu is created.
         * @param {Object} menu - jqxMenu's jQuery object.
         * @param {Object} settings - Object with the menu's initialization settings.
         */
        contextMenuCreate: function(menu, settings)
        {
            var source = settings.source;
            //source.push({ id: "delete", label: "Delete Appointment" });
            source.push({
                id: "status", label: "Κατάσταση", items:
                    [
                        { label: "Ολοκληρωμένο", id: "free" },
                        { label: "Κοινό", id: "tentative" },
                        { label: "Επείγον", id: "busy" }
                    ]
            });
        },
        /**
         * called when the user clicks an item in the Context Menu. Returning true as a result disables the built-in Click handler.
         * @param {Object} menu - jqxMenu's jQuery object.
         * @param {Object} the selected appointment instance or NULL when the menu is opened from cells selection.
         * @param {jQuery.Event Object} the jqxMenu's itemclick event object.
         */
        contextMenuItemClick: function (menu, appointment, event)
        {
            var args = event.args;

            switch (args.id) {
                //case "delete":
                //    $("#scheduler").jqxScheduler('deleteAppointment', appointment.id);
                //    return true;
                case "free":
                    appointment.originalData.status = "free";
                    changeAppointment({args:{appointment:appointment}});
                    return true;
                case "tentative":
                    appointment.originalData.status = "tentative";
                    changeAppointment({args:{appointment:appointment}});
                    return true;
                case "busy":
                    appointment.originalData.status = "busy";
                    changeAppointment({args:{appointment:appointment}});
                    return true;
            }

            /**
             * @todo SAVE
             */
        },
        /**
         * called when the menu is opened.
         * @param {Object} menu - jqxMenu's jQuery object.
         * @param {Object} the selected appointment instance or NULL when the menu is opened from cells selection.
         * @param {jQuery.Event Object} the open event.
         */
        //contextMenuOpen: function (menu, appointment, event) {
        //    if (!appointment) {
        //        menu.jqxMenu('hideItem', 'delete');
        //        menu.jqxMenu('hideItem', 'status');
        //    }
        //    else {
        //        menu.jqxMenu('showItem', 'delete');
        //        menu.jqxMenu('showItem', 'status');
        //    }
        //},
        /**
         * called when the menu is closed.
         * @param {Object} menu - jqxMenu's jQuery object.
         * @param {Object} the selected appointment instance or NULL when the menu is opened from cells selection.
         * @param {jQuery.Event Object} the close event.
         */
        //contextMenuClose: function (menu, appointment, event) {
        //}
    });
    /**
     * Our first job is to call the REST method
     * to populate our scheduler
     */
    getAppointments();
};