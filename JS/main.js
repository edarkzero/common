var MainApp = MainApp || {};

MainApp.common = {
    undefined: function (value) {
        return typeof value == 'undefined'
    },
    null: function (value) {
        return value == null;
    },
    replaceUndefined: function (oldValue, newValue) {
        if (MainApp.common.undefined(oldValue))
            return newValue;
        else return oldValue;
    },
    replaceNull: function (oldValue, newValue) {
        if (MainApp.common.null(oldValue))
            return newValue;
        else return oldValue;
    }
};

MainApp.messages = {
    loading: "Loading",
    error: "Error",
    set: function (loading, error) {
        MainApp.messages.loading = loading;
        MainApp.messages.error = error;
    }
};

MainApp.loading = {
    target: '#ajax-loading',
    title: '#ajax-loading-title',
    toggle: function (title, hide) {
        var $title = $(MainApp.loading.title);
        var $loading = $(MainApp.loading.target);

        if (typeof title == 'undefined')
            title = MainApp.messages.loading;

        $title.html(title);

        if (typeof hide == 'undefined')
            $loading.toggleClass('hide');
        else
            $loading.toggleClass('hide', hide);
    },
    show: function (title) {
        MainApp.loading.toggle(title, false);
    },
    hide: function () {
        MainApp.loading.toggle('', true);
    }
}

MainApp.ajax = {
    header: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    },
    send: function (data, loadingMsj, url, method, dataType, handle) {
        if (typeof loadingMsj == 'undefined')
            loadingMsj = MainApp.messages.loading;

        if (typeof url == 'undefined')
            url = '';

        if (typeof method == 'undefined')
            method = 'POST';

        if (typeof dataType == 'undefined')
            dataType = 'json';

        $.ajax({
                headers: MainApp.ajax.header,
                method: method,
                dataType: dataType,
                data: data,
                url: url,
                beforeSend: function () {
                    MainApp.loading.show(loadingMsj);
                }
            })
            .done(function (response) {
                MainApp.loading.hide();
                if (typeof handle != 'undefined')
                    handle(response, dataType);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                MainApp.loading.hide();
                if (MainApp.common.undefined(jqXHR.responseJSON))
                    MainApp.modal.dialog(MainApp.messages.error, jqXHR.responseText);
                else
                    $.each(jqXHR.responseJSON, function (index, value) {
                        if (typeof index == 'object') {
                            $.each(index, function (i, v) {
                                console.log(i + ", " + v);
                            });
                        }
                        else {
                            console.log(index + ", " + value);
                        }
                    });
                //MainApp.modal.dialog(MainApp.messages.error, jqXHR.responseJSON);
            });
    }
};

MainApp.html = {
    ajaxReplace: function (target, data, loadingMsj, url, method) {
        MainApp.ajax.send(data, loadingMsj, url, method, "html", function (res) {
            var $target = $(target);
            //$target.hide(0);
            $target.html(res);
            $target.fadeIn(800);
        });
    }
};

MainApp.modal = {
    dialogTarget: '#modal-dialog',
    dialogTitle: '.modal-header h4',
    dialogBody: '.modal-body',
    dialog: function (title, message) {
        $(MainApp.modal.dialogTarget + " " + MainApp.modal.dialogTitle).html(title);
        $(MainApp.modal.dialogTarget + " " + MainApp.modal.dialogBody).html(message);

        $(MainApp.modal.dialogTarget).modal('show');
    },
    hide: function () {
        $(MainApp.modal.dialogTarget).modal('hide');
    },
    ajax: function (data, loadingMsj, url, method, dataType) {
        MainApp.ajax.send(data, loadingMsj, url, method, dataType, function (res, dt) {
            if (dt === 'json')
                MainApp.modal.dialog(res.title, res.body);
            else
                MainApp.modal.dialog("", res);
        });
    },
    delete: function (triggererID, wrapperID, modalID, handle) {
        triggererID = MainApp.common.replaceUndefined(triggererID, '#modal-delete-button');
        wrapperID = MainApp.common.replaceUndefined(modalID, '#modal-delete-wrapper');
        modalID = MainApp.common.replaceUndefined(modalID, '#modal-delete');

        $(wrapperID).on('click', triggererID, function (e) {
            e.preventDefault();
            var $elem = $(this);
            MainApp.ajax.send({_method: 'delete', id: $elem.attr('data-id')}, undefined, $elem.attr('data-url'), 'POST', 'json', function () {
                $(modalID).modal('hide');
                handle();
            });
        });
    }
};