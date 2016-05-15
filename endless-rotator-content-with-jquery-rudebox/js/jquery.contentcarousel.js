(function($) {
	var cache	= {},
		aux		= {
			// навигация влево/вправо
			navigate	: function( dir, $el, $wrapper, opts ) {
				var scroll		= opts.scroll,
					factor		= 1,
					idxClicked	= 0;
					
				if( cache.expanded ) {
					scroll		= 1; // scroll всегда равен в режиме полного просмотра
					factor		= 3; // ширина увеличенног пункта в 3 раза больше ширины свернутого пункта	
					idxClicked	= cache.idxClicked; // Индекс выбранного пункта
				}
				
				// Клонируем элементы справа/слева и добавляем их в соответствии направлением вращения
				if( dir === 1 ) {
					$wrapper.find('div.ca-item:lt(' + scroll + ')').each(function(i) {
						$(this).clone(true).css( 'left', ( cache.totalItems - idxClicked + i ) * cache.itemW * factor + 'px' ).appendTo( $wrapper );
					});
				}
				else {
					var $first	= $wrapper.children().eq(0);
					
					$wrapper.find('div.ca-item:gt(' + ( cache.totalItems  - 1 - scroll ) + ')').each(function(i) {
						// Вставляем перед $first, так что они остаются в правильном порядкеы
						$(this).clone(true).css( 'left', - ( scroll - i + idxClicked ) * cache.itemW * factor + 'px' ).insertBefore( $first );
					});
				}
				
				// Анимируем левую строноу каждого пункта.
				// Вычисления зависят от направления и значения cache.expanded.
				$wrapper.find('div.ca-item').each(function(i) {
					var $item	= $(this);
					$item.stop().animate({
						left	:  ( dir === 1 ) ? '-=' + ( cache.itemW * factor * scroll ) + 'px' : '+=' + ( cache.itemW * factor * scroll ) + 'px'
					}, opts.sliderSpeed, opts.sliderEasing, function() {
						if( ( dir === 1 && $item.position().left < - idxClicked * cache.itemW * factor ) || ( dir === -1 && $item.position().left > ( ( cache.totalItems - 1 - idxClicked ) * cache.itemW * factor ) ) ) {
							// Удаляем пункт, который был клонирован
							$item.remove();
						}						
						cache.isAnimating	= false;
					});
				});
				
			},
			// Открываем пункт
			openItem	: function( $wrapper, $item, opts ) {
				cache.idxClicked	= $item.index();
				// Положение пункта (1, 2, или 3) в окне обзора (видимые пункты) 
				cache.winpos		= aux.getWinPos( $item.position().left );
				$wrapper.find('div.ca-item').not( $item ).hide();
				$item.find('div.ca-content-wrapper').css( 'left', cache.itemW + 'px' ).stop().animate({
					width	: cache.itemW * 2 + 'px',
					left	: cache.itemW + 'px'
				}, opts.itemSpeed, opts.itemEasing)
				.end()
				.stop()
				.animate({
					left	: '0px'
				}, opts.itemSpeed, opts.itemEasing, function() {
					cache.isAnimating	= false;
					cache.expanded		= true;
					
					aux.openItems( $wrapper, $item, opts );
				});
						
			},
			// Открываем все пункты
			openItems	: function( $wrapper, $openedItem, opts ) {
				var openedIdx	= $openedItem.index();
				
				$wrapper.find('div.ca-item').each(function(i) {
					var $item	= $(this),
						idx		= $item.index();
					
					if( idx !== openedIdx ) {
						$item.css( 'left', - ( openedIdx - idx ) * ( cache.itemW * 3 ) + 'px' ).show().find('div.ca-content-wrapper').css({
							left	: cache.itemW + 'px',
							width	: cache.itemW * 2 + 'px'
						});
						
						// Скрываем ссылку "больше"
						aux.toggleMore( $item, false );
					}
				});
			},
			// Выводим / скрываем кнопку "больше"
			toggleMore	: function( $item, show ) {
				( show ) ? $item.find('a.ca-more').show() : $item.find('a.ca-more').hide();	
			},
			// Закрываем все пункты
			// Текущий пункт анимируем
			closeItems	: function( $wrapper, $openedItem, opts ) {
				var openedIdx	= $openedItem.index();
				
				$openedItem.find('div.ca-content-wrapper').stop().animate({
					width	: '0px'
				}, opts.itemSpeed, opts.itemEasing)
				.end()
				.stop()
				.animate({
					left	: cache.itemW * ( cache.winpos - 1 ) + 'px'
				}, opts.itemSpeed, opts.itemEasing, function() {
					cache.isAnimating	= false;
					cache.expanded		= false;
				});
				
				// Выводим кнопку "больше"
				aux.toggleMore( $openedItem, true );
				
				$wrapper.find('div.ca-item').each(function(i) {
					var $item	= $(this),
						idx		= $item.index();
					
					if( idx !== openedIdx ) {
						$item.find('div.ca-content-wrapper').css({
							width	: '0px'
						})
						.end()
						.css( 'left', ( ( cache.winpos - 1 ) - ( openedIdx - idx ) ) * cache.itemW + 'px' )
						.show();
						
						// Выводим кнопку "больше"
						aux.toggleMore( $item, true );
					}
				});
			},
			// Получаем положение пункта (1, 2, или 3) в окне обзора (видимые пункты)
			// val - смещение пункта слева
			getWinPos	: function( val ) {
				switch( val ) {
					case 0 					: return 1; break;
					case cache.itemW 		: return 2; break;
					case cache.itemW * 2 	: return 3; break;
				}
			}
		},
		methods = {
			init 		: function( options ) {
				
				if( this.length ) {
					
					var settings = {
						sliderSpeed		: 500,			// Скорость анимации проскальзывания
						sliderEasing	: 'easeOutExpo',// Эффект для анимации проскальзывания
						itemSpeed		: 500,			// Скорость анимации открытия/закрытия пункта
						itemEasing		: 'easeOutExpo',// Эффект для анимации открытия/закрытия пункта
						scroll			: 1				// Число пунктов для прокручивания за один раз
					};
					
					return this.each(function() {
						
						// Если опции заданы, объединяем их со значениями по умолчанию
						if ( options ) {
							$.extend( settings, options );
						}
						
						var $el 			= $(this),
							$wrapper		= $el.find('div.ca-wrapper'),
							$items			= $wrapper.children('div.ca-item');
						
						// Сохраняем ширину одного пункта
						cache.itemW			= $items.width();
						// Сохраняем количество пунктов
						cache.totalItems	= $items.length;
						
						// Добавляем кнопки навигации
						if( cache.totalItems > 3 )	
							$el.prepend('<div class="ca-nav"><span class="ca-nav-prev">Previous</span><span class="ca-nav-next">Next</span></div>')	
						
						// Управление значением прокручивания
						if( settings.scroll < 1 )
							settings.scroll = 1;
						else if( settings.scroll > 3 )
							settings.scroll = 3;	
						
						var $navPrev		= $el.find('span.ca-nav-prev'),
							$navNext		= $el.find('span.ca-nav-next');
						
						// Скрываем пункты за исключение первых 3
						$wrapper.css( 'overflow', 'hidden' );
						
						// Пункты будут позтционироваться абсолютно.
						// Вычисления производятся слева.
						$items.each(function(i) {
							$(this).css({
								position	: 'absolute',
								left		: i * cache.itemW + 'px'
							});
						});
						
						// Нажатие для открытия пункта
						$el.find('a.ca-more').live('click.contentcarousel', function( event ) {
							if( cache.isAnimating ) return false;
							cache.isAnimating	= true;
							$(this).hide();
							var $item	= $(this).closest('div.ca-item');
							aux.openItem( $wrapper, $item, settings );
							return false;
						});
						
						// Нажатие для закрытия пункта
						$el.find('a.ca-close').live('click.contentcarousel', function( event ) {
							if( cache.isAnimating ) return false;
							cache.isAnimating	= true;
							var $item	= $(this).closest('div.ca-item');
							aux.closeItems( $wrapper, $item, settings );
							return false;
						});
						
						// Навигация влево
						$navPrev.bind('click.contentcarousel', function( event ) {
							if( cache.isAnimating ) return false;
							cache.isAnimating	= true;
							aux.navigate( -1, $el, $wrapper, settings );
						});
						
						// Навигация вправо
						$navNext.bind('click.contentcarousel', function( event ) {
							if( cache.isAnimating ) return false;
							cache.isAnimating	= true;
							aux.navigate( 1, $el, $wrapper, settings );
						});
						
						// События мыши
						$el.bind('mousewheel.contentcarousel', function(e, delta) {
							if(delta > 0) {
								if( cache.isAnimating ) return false;
								cache.isAnimating	= true;
								aux.navigate( -1, $el, $wrapper, settings );
							}	
							else {
								if( cache.isAnimating ) return false;
								cache.isAnimating	= true;
								aux.navigate( 1, $el, $wrapper, settings );
							}	
							return false;
						});
						
					});
				}
			}
		};
	
	$.fn.contentcarousel = function(method) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Метод ' +  method + ' не существует в jQuery.contentcarousel' );
		}
	};
	
})(jQuery);