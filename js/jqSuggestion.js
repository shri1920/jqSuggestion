/*jslint nomen:true, regexp:true */
/*globals jQuery*/
/*********************
    jqSuggest is a jQuery based auto suggestion plugin. Which display
    the suggestion list based on charactors persent in input fields.
    Creator: Shrisha Bayari. shrisha.sb@gmail.com
**********************/
(function ($) {
    "use strict";
    var JqSuggest,
        _JqSuggest,
        html = {
            wrap            : "<div class='jqs-wrap'><div class='jqs-selected-wrap'></div></div>",
            suggestion_wrap : "<div class='jqs-suggestion-wrap'></div>",
            selected        : "<span class='jqs-selected'><img class='jqs-delete' src='images/delete.png'/></span>",
            suggestions     : "<div class='jqs-options'></div>",
            prevent_float   : "<div style='clear:both'></div>"
        },
        getSuggestion,
        clearSuggestion,
        addSuggestion,
        toggleSuggestion;
    JqSuggest  = function () {};
    _JqSuggest = JqSuggest.prototype;
    /*
        getSuggestion function will find the suggesions according to
        matched input charactors.
    */
    getSuggestion = function (new_val, suggestions) {
        var i, j, correct, words = [], word;
        for (i = 0; i < suggestions.length; i += 1) {
            j = -1;
            correct = 1;
            new_val = new_val.toLowerCase();
            word    = suggestions[i].toLowerCase();
            while (correct === 1 && ++j < new_val.length) {
                if (word.charAt(j) !== new_val.charAt(j)) {
                    correct = 0;
                }
            }
            if (correct === 1) {
                words[words.length] = suggestions[i];
            }
        }
        return words;
    };
    /*
        clearSuggestion function will clear the suggestion list.
        In orde to display nwe matched list.
    */
    clearSuggestion = function (selector) {
        selector.empty();
    };
    /*
        addSuggestion function will list all the matched suggestion.
    */
    addSuggestion = function (word, selector) {
        var option = $(html.suggestions);
        option.append(word);
        selector.append(option);
        selector.width(selector.prev(".jqs-selected-wrap").width());
    };
    /*
        toggleSuggestion function will hide or show the suggestion list.
    */
    toggleSuggestion = function (type, selector, options) {
        if (type === "show") {
            selector.show();
            options.selected_option = 0;
        } else {
            selector.hide();
        }
    };
    /*
        keyEventHandler function will listen to key board event and,
        Will perform the operation (Add / Remove selection) according to it.
    */
    _JqSuggest.keyEventHandler = function (e) {
        // Required variable declaration
        var input, self = this, cur_data, element, suggestion_wrap, delimiter, options, active_item;
        // Required variable initilization
        input = $(e.target);
        options = self.options;
        suggestion_wrap = input.parents(".jqs-wrap").find(".jqs-suggestion-wrap");
        // When "BACKSPACE" key is pressed, and if there is no char in input then remove the last selected element.
        if (e.which === 8 && input.val().trim() === "") {
            if (input.parents(".jqs-wrap").find(".jqs-selected").length > 0) {
                active_item = input.parents(".jqs-wrap").find(".jqs-selected").last().text().trim();
                options.selected.splice(options.selected.indexOf(active_item), 1);
                cur_data = input.parents(".jqs-wrap").find(".jqs-selected").last();
                cur_data.remove();
                if (self.options.update && typeof self.options.update === "function") {
                    self.options.update({
                        event: "delete",
                        value: active_item
                    });
                }
            }
            return;
        }
        // When "ENTER" key is pressed, Select either input val or selected option from sugestion list.
        if (e.which === 13 && input.val().trim() !== "") {
            // If active suggestions, Then select it. Else get the data from input field.
            if (suggestion_wrap.find(".jqs-active").length > 0) {
                active_item = suggestion_wrap.find(".jqs-active").text().trim();
            } else {
                active_item = input.val().trim().toLowerCase();
            }
            // If user don't want to allow the duplicated entries.
            if (!options.duplicate && options.selected.indexOf(active_item) >= 0) {
                input.parents(".jqs-wrap").find("input").val("");
                toggleSuggestion("hide", suggestion_wrap, self.options);
                return;
            }
            if (self.options.limit && typeof self.options.limit === "number") {
                if (self.options.selected.length >= self.options.limit) {
                    input.val("");
                    input.blur();
                    return;
                }
            }
            element = $(html.selected);
            element.prepend(active_item);
            input.parents(".jqs-wrap").find("input").before(element);
            options.selected.push(active_item);
            input.parents(".jqs-wrap").find("input").val("");
            toggleSuggestion("hide", suggestion_wrap, self.options);
            if (self.options.update && typeof self.options.update === "function") {
                self.options.update({
                    event: "add",
                    value: active_item
                });
            }
            return;
        }
        // When "TOP / DOWN" navigation are pressed and suggestion is displayed then scroll through the list.
        if (e.which === 38 || e.which === 40) {
            if (suggestion_wrap.css("display") === "block") {
                if (e.which === 38) {
                    delimiter = -1;
                }
                if (e.which === 40) {
                    delimiter = 1;
                }
                options.selected_option = (options.selected_option + delimiter) % suggestion_wrap.find(".jqs-options").length;
                if (options.selected_option < 0) {
                    options.selected_option = options.selected_option + suggestion_wrap.find(".jqs-options").length;
                }
                if (suggestion_wrap.find(".jqs-active").length === 0) {
                    options.selected_option = 0;
                }
                suggestion_wrap.find(".jqs-active").removeClass("jqs-active");
                active_item = suggestion_wrap.find(".jqs-options").eq(options.selected_option);
                active_item.addClass("jqs-active");
                if (active_item.offset().top + active_item.height() > suggestion_wrap.offset().top + suggestion_wrap.height()) {
                    suggestion_wrap.scrollTop(suggestion_wrap.scrollTop() + active_item.height());
                }
                if (active_item.offset().top < suggestion_wrap.offset().top) {
                    suggestion_wrap.scrollTop(suggestion_wrap.scrollTop() - active_item.height());
                }
            }
        }
        // When "ESC" key is pressed clear the input and hide the suggestion.
        if (e.which === 27) {
            input.val('');
            input.blur();
            toggleSuggestion("hide", suggestion_wrap, self.options);
        }
    };
    /*
        clickEventHandler function will listen to click events and perform operation according to the it.
    */
    _JqSuggest.clickEventHandler = function (e) {
        var element = $(e.target), cur_data, self = this, active_item;
        // If delete option (cross mark) is clicked. The clicked element will be dropped from selection.
        if (element.hasClass("jqs-delete")) {
            active_item = element.parents(".jqs-selected").text().trim();
            self.options.selected.splice(self.options.selected.indexOf(active_item), 1);
            cur_data = element.parents(".jqs-selected");
            cur_data.remove();
            if (self.options.update && typeof self.options.update === "function") {
                self.options.update({
                    event: "delete",
                    value: active_item
                });
            }
            return;
        }
        // If any options from the suggestion list is clicked, the same will be selected.
        if (element.hasClass("jqs-options")) {
            active_item = element.text().trim();
            if (!self.options.duplicate && self.options.selected.indexOf(active_item) >= 0) {
                element.parents(".jqs-wrap").find("input").val("");
                toggleSuggestion("hide", element.parents(".jqs-wrap").find(".jqs-suggestion-wrap"), self.options);
                return;
            }
            if (self.options.limit && typeof self.options.limit === "number") {
                if (self.options.selected.length >= self.options.limit) {
                    element.parents(".jqs-wrap").find("input").val("");
                    element.parents(".jqs-wrap").find("input").blur();
                    toggleSuggestion("hide", element.parents(".jqs-wrap").find(".jqs-suggestion-wrap"), self.options);
                    return;
                }
            }
            cur_data = $(html.selected);
            cur_data.prepend(active_item);
            element.parents(".jqs-wrap").find("input").before(cur_data);
            element.parents(".jqs-wrap").find("input").val("");
            self.options.selected.push(active_item);
            toggleSuggestion("hide", element.parents(".jqs-wrap").find(".jqs-suggestion-wrap"), self.options);
            if (self.options.update && typeof self.options.update === "function") {
                self.options.update({
                    event: "add",
                    value: active_item
                });
            }
            return;
        }
        element.parents(".jqs-wrap").find("input").focus();
    };
    /*
        blurEventHandler function will hide the suggestion list and clear the input filed when
        focus is moved out of active input filed.
    */
    _JqSuggest.blurEventHandler = function (e) {
        var self = this, input = $(e.target);
        input.val('');
        toggleSuggestion("hide", input.parents(".jqs-wrap").find(".jqs-suggestion-wrap"), self.options);
    };
    /*
        mouseOverEventHandler function will activate the options present in sugestion list,
        When mouse cursor is moved on them.
    */
    _JqSuggest.mouseOverEventHandler = function (e) {
        var self = this, suggestion_list = $(e.target);
        if (suggestion_list.hasClass("jqs-options")) {
            suggestion_list.parent().find(".jqs-active").removeClass("jqs-active");
            suggestion_list.addClass("jqs-active");
            self.options.selected_option = suggestion_list.index();
        }
    };
    /*
         Examin function will examin the input field for the changes,
         And will display the suggestion according to the matched input element.
    */
    _JqSuggest.examin = function (input) {
        var new_val = input.val().trim(), i, suggestion_wrap, words = [], self = this;
        suggestion_wrap = input.parents(".jqs-wrap").find(".jqs-suggestion-wrap");
        if (new_val) {
            words = getSuggestion(new_val, this.options.suggestions) || [];
            if (words.length > 0) {
                clearSuggestion(suggestion_wrap);
                for (i = 0; i < words.length; i += 1) {
                    addSuggestion(words[i], suggestion_wrap);
                }
                toggleSuggestion("show", suggestion_wrap, self.options);
            } else {
                toggleSuggestion("hide", suggestion_wrap, self.options);
            }
        } else {
            toggleSuggestion("hide", suggestion_wrap, self.options);
        }
    };
    /*
        Init function is for initial setup,
        Preparing the elements required for the plugin and binding the required events.
    */
    _JqSuggest.init = function (input) {
        var self = this, i, element;
        // Append the html element required for the plugin
        input.wrap(html.wrap);
        input.parent().after(html.suggestion_wrap);
        if (this.options.preSelected.length > 0) {
            for (i = 0; i < this.options.preSelected.length; i += 1) {
                element = $(html.selected);
                element.prepend(this.options.preSelected[i]);
                input.before(element);
                self.options.selected.push(this.options.preSelected[i]);
            }
        }
        input.after(html.prevent_float);
        // Event, which will be triggered when there is a change in the input field.
        input.on("input", function () {
            self.examin(input);
        });
        input.on("keydown", function (e) {
            self.keyEventHandler(e);
        });
        input.parents(".jqs-wrap").on("click", function (e) {
            self.clickEventHandler(e);
        });
        input.parents(".jqs-wrap").find(".jqs-suggestion-wrap").on("mouseover", function (e) {
            self.mouseOverEventHandler(e);
        });
        input.on("blur", function (e) {
            setTimeout(function () {
                self.blurEventHandler(e);
            }, 200);
        });
    };
    /*
         Defining the new jQuery plugin "jqSuggest"
    */
    $.fn.jqSuggestion = function (options) {
        return this.each(function () {
            var instance = new JqSuggest();
            options = options || {};
            if (options) {
                instance.options = $.extend({
                    selected: [],
                    selected_option: 0
                }, options);
            }
            instance.init($(this));
        });
    };
}(jQuery));
