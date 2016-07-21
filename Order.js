module.exports = function() {
    this.id;
	this.status;
	this.delivery_date;
	this.items = [];
	this.address_shipping = "";
	this.loadAddress=function(formData) {
		this.address_shipping = formData.address_street_1 + " " + formData.address_street_2 + " " +
								formData.address_postal_code + " " + formData.address_country;
	}
}
