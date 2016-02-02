// Constructor
function StateSchema() 
{
	//
  	// Instance properties
	//
    this.temperature             = 0;
	this.servo			     	 = {	
		speed : 0,
		direction : 0
	};
}

//
// class methods
//

// export the class
module.exports = StateSchema;