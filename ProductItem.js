module.exports = function(productId,name) {
	this.id;
	this.productId=productId;
	this.name=name;
	this.description="";
	this.price=0;
	this.imgURL="";
}

module.exports.setId = function (item) {
	if(item !== undefined)
	{
		item.itemId = item.productId+"-"+(new Date()).getTime();
		return item;
	}
}