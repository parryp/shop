function addToCart(product_id,name,button)
{
	
	ele_addToCart = $("td:contains("+name+")").next().next().find("a");
	ele_addToCart.hide(); //prevent multi clicks while adding to cart.
	
	var jqxhr = $.post("/cart/add", {productId:product_id}, 
					function(data, textStatus) { 
						if( data == "OK" ) // remove
						{ 
							$.notify(name + " is in your cart", "success", { position : "top center" } );
							cartSize = parseInt($("#cartstatus").text(),10);
							
							if( ! isNaN(cartSize) )
								$("#cartstatus").text(cartSize+=1);
							
							ele_addToCart.show();
						}
					});
	jqxhr.fail(function(data, textStatus) { 
					$.notify("Couldn't add " + name +" to cart", "error", {position:"middle"});
					ele_addToCart.show();
			});
}

function updateCartTotalAmount()
{
	amount=0.0;
	$("td.itemPrice").each( 
		function(ele) { 
			price=parseFloat($(this).text());
			if( ! isNaN(price) )
				amount+=price;
		} );
	$("#total").text( amount.toFixed(2) );
}

function removeFromCart(itemId)
{
	var jqxhr = $.post("/cart/remove", {itemId:itemId}, 
					function(data, textStatus) { 
						if( data == "OK" ) // remove
						{ 
							$("tr#"+itemId).remove();
							
							cartSize = parseInt($("#cartstatus").text(),10);
							
							if( ! isNaN(cartSize) )
								$("#cartstatus").text(cartSize-=1);
								
							updateCartTotalAmount();
							
							if($("tr").length < 4 ) $("tr")[1].remove(); //remove row displaying Total
						}
					});
	jqxhr.fail(function(data, textStatus) { console.log('data='+data+" textStatus="+textStatus);  });
}

function checkOut(button)
{
	if( parseInt($("#cartstatus").text(), 10) < 1 )
	{
		$(button).notify("Your cart is empty.",  { position : "top center" } , "error" );
	}
	else
		document.location.href="/cart";
}

$(document).ready(function() {
});