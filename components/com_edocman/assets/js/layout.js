
(function($){
	// Function to alternative between list/grid
	changeLayout = (function(){
		 var cookieLayout = $.cookie(cookieVar);
		    if (!cookieLayout)
		    {
		        cookieLayout = defaultCookieLayout;
		    }
		    if(cookieLayout=='grid')
		    {
		        $("#edocman-documents").removeClass('list').addClass('grid');
		        $("#edocman-documents .edocman-document").each(function(){
		            $(this).removeClass(rowFluidClass).addClass(spanClass);
		        });
		    }
		    else
		    {
		        $("#edocman-documents").removeClass('grid').addClass('list');
		        $("#edocman-documents .edocman-document").each(function(){
		        	$(this).removeClass(spanClass).addClass(rowFluidClass);
		        });
		    }
			$(".sortPagiBar .btn-group a").click(function()
		    {
				if(this.rel=='grid')
				{
					$("#edocman-documents").removeClass('list').addClass('grid');
		            $("#edocman-documents .edocman-document").each(function(){
		            	$(this).removeClass(rowFluidClass).addClass(spanClass);
		            });
				}
				else
				{
					$("#edocman-documents").removeClass('grid').addClass('list');
		            $("#edocman-documents .edocman-document").each(function(){
		            	$(this).removeClass(spanClass).addClass(rowFluidClass);
		            });
				}
		        $.cookie(cookieVar, this.rel);
				return false;
			});
	})
	
	$(document).ready(function() {	
		changeLayout();
	});
})(jQuery)