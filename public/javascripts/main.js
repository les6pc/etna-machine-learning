jQuery(document).ready(function($){
	//change this value if you want to change the speed of the scale effect
	var	scaleSpeed = 0.3,
	//change this value if you want to set a different initial opacity for the .cd-half-block
		boxShadowOpacityInitialValue = 0.7,
		animating = false; 
	
	//check the media query 
	var MQ = window.getComputedStyle(document.querySelector('body'), '::before').getPropertyValue('content').replace(/"/g, "");
	$(window).on('resize', function(){
		MQ = window.getComputedStyle(document.querySelector('body'), '::before').getPropertyValue('content').replace(/"/g, "");
	});

	//bind the animation to the window scroll event
	triggerAnimation();
	$(window).on('scroll', function(){
		triggerAnimation();
	});

	//move to next/previous section
    $('.cd-vertical-nav .cd-prev').on('click', function(){
    	prevSection();
    });
    $('.cd-vertical-nav .cd-next').on('click', function(){
    	nextSection();
    });
    $(document).keydown(function(event){
		if( event.which=='38' ) {
			prevSection();
			event.preventDefault();
		} else if( event.which=='40' ) {
			nextSection();
			event.preventDefault();
		}
	});

	function triggerAnimation(){
		if(MQ == 'desktop') {
			//if on desktop screen - animate sections
			(!window.requestAnimationFrame) ? animateSection() : window.requestAnimationFrame(animateSection);
		} else {
			//on mobile - remove the style added by jQuery 
			$('.cd-section').find('.cd-block').removeAttr('style').find('.cd-half-block').removeAttr('style');
		}
		//update navigation arrows visibility
		checkNavigation();
	}
	
	function animateSection () {
		var scrollTop = $(window).scrollTop(),
			windowHeight = $(window).height(),
			windowWidth = $(window).width();
		
		$('.cd-section').each(function(){
			var actualBlock = $(this),
				offset = scrollTop - actualBlock.offset().top,
				scale = 1,
				translate = windowWidth/2+'px',
				opacity,
				boxShadowOpacity;

			if( offset >= -windowHeight && offset <= 0 ) {
				//move the two .cd-half-block toward the center - no scale/opacity effect
				scale = 1,
				opacity = 1,
				translate = (windowWidth * 0.5 * (- offset/windowHeight)).toFixed(0)+'px';

			} else if( offset > 0 && offset <= windowHeight ) {
				//the two .cd-half-block are in the center - scale the .cd-block element and reduce the opacity
				translate = 0+'px',
				scale = (1 - ( offset * scaleSpeed/windowHeight)).toFixed(5),
				opacity = ( 1 - ( offset/windowHeight) ).toFixed(5);

			} else if( offset < -windowHeight ) {
				//section not yet visible
				scale = 1,
				translate = windowWidth/2+'px',
				opacity = 1;

			} else {
				//section not visible anymore
				opacity = 0;
			}
			
			boxShadowOpacity = parseInt(translate.replace('px', ''))*boxShadowOpacityInitialValue/20;
			
			//translate/scale section blocks
			scaleBlock(actualBlock.find('.cd-block'), scale, opacity);

			var directionFirstChild = ( actualBlock.is(':nth-of-type(even)') ) ? '-': '+';
			var directionSecondChild = ( actualBlock.is(':nth-of-type(even)') ) ? '+': '-';
			if(actualBlock.find('.cd-half-block')) {
				translateBlock(actualBlock.find('.cd-half-block').eq(0), directionFirstChild+translate, boxShadowOpacity);
				translateBlock(actualBlock.find('.cd-half-block').eq(1), directionSecondChild+translate, boxShadowOpacity);	
			}
			//this is used to navigate through the sections
			( offset >= 0 && offset < windowHeight ) ? actualBlock.addClass('is-visible') : actualBlock.removeClass('is-visible');		
		});
	}

	function translateBlock(elem, value, shadow) {
		var position = Math.ceil(Math.abs(value.replace('px', '')));
		
		if( position >= $(window).width()/2 ) {
			shadow = 0;	
		} else if ( position > 20 ) {
			shadow = boxShadowOpacityInitialValue;
		}

		elem.css({
		    '-moz-transform': 'translateX(' + value + ')',
		    '-webkit-transform': 'translateX(' + value + ')',
			'-ms-transform': 'translateX(' + value + ')',
			'-o-transform': 'translateX(' + value + ')',
			'transform': 'translateX(' + value + ')',
			'box-shadow' : '0px 0px 40px rgba(0,0,0,'+shadow+')'
		});
	}

	function scaleBlock(elem, value, opac) {
		elem.css({
		    '-moz-transform': 'scale(' + value + ')',
		    '-webkit-transform': 'scale(' + value + ')',
			'-ms-transform': 'scale(' + value + ')',
			'-o-transform': 'scale(' + value + ')',
			'transform': 'scale(' + value + ')',
			'opacity': opac
		});
	}

	function nextSection() {
		if (!animating) {
			if ($('.cd-section.is-visible').next().length > 0) smoothScroll($('.cd-section.is-visible').next());
		}
	}

	function prevSection() {
		if (!animating) {
			var prevSection = $('.cd-section.is-visible');
			if(prevSection.length > 0 && $(window).scrollTop() != prevSection.offset().top) {
				smoothScroll(prevSection);
			} else if(prevSection.prev().length > 0 && $(window).scrollTop() == prevSection.offset().top) {
				smoothScroll(prevSection.prev('.cd-section'));
			}
		}
	}

	function checkNavigation() {
		( $(window).scrollTop() < $(window).height()/2 ) ? $('.cd-vertical-nav .cd-prev').addClass('inactive') : $('.cd-vertical-nav .cd-prev').removeClass('inactive');
		( $(window).scrollTop() > $(document).height() - 3*$(window).height()/2 ) ? $('.cd-vertical-nav .cd-next').addClass('inactive') : $('.cd-vertical-nav .cd-next').removeClass('inactive');
	}

	function smoothScroll(target) {
		animating = true;
        $('body,html').animate({'scrollTop': target.offset().top}, 500, function(){ animating = false; });
	}


	// Search Twitter profile
	// $(window).on('scroll', function () {
	// 	if ($(".wide").parent().parent().hasClass('is-visible')){
	// 		$(".wide").removeClass('hidden');
	// 	}
	// 	else {
	// 		$(".wide").addClass('hidden');
	// 	}
	// });
	var screen_name = "";
	$('#username-search').on('submit', function(e) {
		e.preventDefault();
		screen_name = $("#username").val();
		if ( screen_name != "" ) {
			var jsonUrl = "search/"+screen_name;
			$('#result, #profil').addClass('hidden');
			$('#profil').removeClass('fadeInDown');
			getJsonUser(jsonUrl);
		}
	});

	function getJsonUser(jsonUrl) {
		var postUrl = "user";
		$.getJSON(jsonUrl, function (json) {
			if (json.errors) {
				$('#result').removeClass('hidden');
			}
			else {
				profilBar(json.profile_image_url, json.screen_name, json.name, json.statuses_count, json.friends_count, json.followers_count);
				postJsonUser(postUrl);
			}
		});
	}

	function postJsonUser(postUrl) {
		var data = { 'screen_name' : screen_name};
		$('#loader').removeClass('hidden');
		$.ajax({
		    url: postUrl,
		    type: 'POST',
		    data: JSON.stringify(data),
		    contentType: 'application/json; charset=utf-8',
		    dataType: 'json',
		    success: function(json){
				$('#loader').addClass('hidden');
				if (!animating) {
					if ($('.cd-section.is-visible').next().length > 0) smoothScroll($('.cd-section.is-visible').next());
				}
				showMetrics(json.user.statuses_count, json.user.metrics.totalRetweet, json.user.metrics.totalFav, json.user.metrics.tweetZeroRT, json.user.metrics.tweetZeroFAV, json.user.metrics.averageRT, json.user.metrics.averageFAV);
			},
			error: function(){
				$('#loader').addClass('hidden');
				alert('Request failed.');
			}
		});
	}

	function profilBar(img, screen_name, name, statuses, friends, followers) {
		$("#profil").removeClass('hidden').addClass('animated fadeInDown');
		$("#img-profil").html('<img src="'+img+'" alt="profil img">');
		$("#screen_name-profil").html("@"+screen_name);
		$("#name-profil").html(name);
		$("#status-profil").html("<small>Tweets</small>"+statuses);
		$("#friends-profil").html("<small>Abonnements</small>"+friends);
		$("#followers-profil").html("<small>Abonnés</small>"+followers);
	}

	function showMetrics(statuses, totalRT, totalFav, noRT, noFav, avRT, avFav) {
		avRT = Math.round(avRT * 10) / 10;
		avFav = Math.round(avFav * 10) / 10;

		$(".totalStatuses").html(statuses);
		$("#totalRT").html(totalRT);
		$("#averageRT").html(avRT);
		$("#noRT").html(noRT);

		$("#totalFav").html(totalFav);
		$("#averageFav").html(avFav);
		$("#noFav").html(noFav);
	}



	window.onload = function () {
		var chart = new CanvasJS.Chart("chartContainer",
		{
			axisY:{
	        	title: "Nombre de tweets"
	      	},
	      	axisX:{
	        	title: "Heure"
	      	},
	      	title:{
	  	        text: "Statistiques sur les 200 derniers tweets"
	  	   	},

			animationEnabled: true,
			// title:{
			// 	text: "Multi Series Spline Chart - Hide / Unhide via Legend"
			// },
			data: [
			{
				type: "spline", //change type to bar, line, area, pie, etc
				showInLegend: true,
				legendText: "Retweet",
				color: "#e3ca76",   
				dataPoints: [
					{ x: 10, y: 51 },
					{ x: 20, y: 45},
					{ x: 30, y: 50 },
					{ x: 40, y: 62 },
					{ x: 50, y: 95 },
					{ x: 60, y: 66 },
					{ x: 70, y: 24 },
					{ x: 80, y: 32 },
					{ x: 90, y: 16}
				]
				},
				{
				type: "spline",
				showInLegend: true,
				legendText: "Favoris",
				color: "#e74c3c",  
				dataPoints: [
					{ x: 10, y: 21 },
					{ x: 20, y: 44},
					{ x: 30, y: 35 },
					{ x: 40, y: 45 },
					{ x: 50, y: 75 },
					{ x: 60, y: 58 },
					{ x: 70, y: 18 },
					{ x: 80, y: 30 },
					{ x: 90, y: 11}
				]
				}
			],
			legend: {
				cursor: "pointer",
				itemclick: function (e) {
					if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
						e.dataSeries.visible = false;
					} else {
						e.dataSeries.visible = true;
				}
				chart.render();
				}
			}
		});

		chart.render();
		$('.canvasjs-chart-credit').addClass('hidden');
	}
});