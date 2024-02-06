/**
 * @package    mod_fsalist
 * @version    1.0.0
 *
 * @copyright  Copyright (C) 2015 - 2021 JoomlaGeek. All Rights Reserved.
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @author     JoomlaGeek <admin@joomlageek.com>
 * @link       https://www.joomlageek.com
 */

var fsaList = window.fsaList || {};

(function($){
	fsaList = function(moduleId, options, data) {
		this.wrapper = $('#gl-' + moduleId);
		this.timeoutId;
		this.xhr;
		this.xhrArrg;
		this.loading;
		this.searchword;
		this.result;
		this.template;

		var self = this;

		this.options = $.extend(true, {}, {
			moduleId: 0,
			token: '',
			baseUrl: '',
			result: {
				pages: 5,
				pageSize: 18,
				displayFields: [],
				showModal: 1
			},
			languageTexts: {}
		}, options );

		this.initialize = function(data) {
			if(self.wrapper.hasClass('initialize')) {
				return;
			}
			self.wrapper.addClass('initialize');

			var opts = self.options;

			if(typeof Joomla.loadOptions == 'function') {
				Joomla.loadOptions({"joomla.jtext": opts.languageTexts});
			} else {
				Joomla.JText.load(opts.languageTexts);
			}

			self.template = self.wrapper.find('.search-result-template').html();
			self.result = self.wrapper.find('div.gl-container');

			if(!$('#geek-list-loading').length) {
				$('body').append(
					$('<div/>', {
						'id': 'geek-list-loading'
					}).html('<div class="inner">'+Joomla.JText._('MOD_GEEKLIST_LOADING', 'Loading...')+'</div>')
				);
			}
			this.loading = $('#geek-list-loading');

			self.render(1, data);
		};

		this.search = function(page) {
			clearTimeout(this.timeoutId);
			this.timeoutId = setTimeout(function() {
				self._search(page);
			}, 500);
		};

		this._search = function(page) {
			var url = self.options.baseUrl + '/index.php?option=com_ajax&module=fsalist&format=json&page='+page;
			url += '&mid='+encodeURIComponent(self.wrapper.find('input[name="mid"]').val());
			url += '&catid='+encodeURIComponent(self.wrapper.find('input[name="catid"]').val());
			url += '&fields='+encodeURIComponent(self.options.result.displayFields.join(','));
			url += '&ordering='+encodeURIComponent(self.wrapper.find('input[name="ordering"]').val());
			url += '&direction='+encodeURIComponent(self.wrapper.find('input[name="direction"]').val());
			url += '&size='+encodeURIComponent(self.options.result.pageSize);

			if(self.xhr && self.xhr.readyState != 4) {
				//abort previous processing requests
				self.xhr.abort();
			}

			self.loading.show();
			self.xhr = $.ajax({
				dataType: "json",
				url: url,
				success: function(data) {
					self.loading.hide();
					self.render(page, data.data);
				}
			}).fail(function(jqxhr, status, error) {
				self.loading.hide();
				var data = JSON.parse(jqxhr.responseText);
				if(data) {
					self.render(page, data.data);
				}
			});
		};

		this.render = function(page, data) {
			var template = self.template;
			//remove code added by SEF system plugin
			template = template.replaceAll('%7B', '{');
			template = template.replaceAll('%7D', '}');
			template = template.replace(/(href|src)\s*=\s*"[^\{\"]+\{\{/gi, '$1="{{');
			Mustache.parse(template);


			var texts = {};
			texts.labelTitle = self.options.languageTexts.labelTitle;
			if(typeof data.total != 'undefined') {
				texts.summary = Joomla.JText._('MOD_GEEKLIST_TOTAL_RESULTS', 'We found %d results.').replace('%d', data.total);
			}

			var rendered = Mustache.render(template, {data: data, options: self.options, texts: texts});

			var result = self.result;
			result.html(rendered);


			//pagination
			if(typeof data.total != 'undefined') {
				var totalItems = data.total;

				var pageSize = self.wrapper.find('input[name="size"]');
				if(pageSize.length) {
					var size = pageSize.val();
				} else {
					var size = self.options.result.pageSize;
				}

				var totalPages = Math.ceil( totalItems / size);
				if(totalPages > 1) {
					result.find('.pagination').twbsPagination({
						totalPages: totalPages,
						startPage: page,
						visiblePages: self.options.result.pages,
						first: Joomla.JText._('MOD_GEEKLIST_FIRST_PAGE', 'First'),
						prev: Joomla.JText._('MOD_GEEKLIST_PREV_PAGE', 'Prev'),
						next: Joomla.JText._('MOD_GEEKLIST_NEXT_PAGE', 'Next'),
						last: Joomla.JText._('MOD_GEEKLIST_LAST_PAGE', 'Last'),
						onPageClick: function (event, p) {
							if(p != page) {
								self.search(p);
							}
						}
					});
				}
			}
		};

		this.initialize(data);
	}
})(jQuery);