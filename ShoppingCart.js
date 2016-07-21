module.exports = function() {
	this.items = [];

/*	Express serialize objects in JSON, since JSON doesn't support functions, best to adhere to convention. More info here,
    http://stackoverflow.com/questions/6754919/json-stringify-function
	
	this.add=function (item){
		this.items.push(item);
		this.size++;
	};

	this.removeByIndex= function (index)
	{
		items = this.items.splice(index,1);
		if(items.length > 0 )
		{
			this.size--;
			return items[0];
		}
		else
			return null;
	};
	
	this.remove=function(item)
	{
		foundIdx = this.items.indexOf(item);
		if(foundIdx > -1) return this.removeByIndex(foundIdx);
		return null;
	};
	
	this.removeByName=function(name)
	{
		for(i=0; i<this.items.length; i++)
		{
			if(this.items[i].name.toLowerCase() == name.toLowerCase() )
			{
				this.removeByIndex(i);
				break;
			}
		}
	};
	
	this.total= function ()
	{
		total=0;
		for(i=0; i<this.items.length; i++)
			total+=this.items[i].price;
		return total;
	}; */
}

module.exports.size = function(req) {
	if(req.session == undefined || req.session.cart == undefined) return 0;
	return req.session.cart.items.length;
}

module.exports.amount = function(cart) {
	total=0.0;
	if(cart == undefined) return total;

	for(i=0; i<cart.items.length; i++)
	{
	    price = parseFloat(cart.items[i].price);
		if( ! isNaN(price))
			total+=price;
	}
	return total.toFixed(2);
}
