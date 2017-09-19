var express = require('express');
var request = require('request');
var https = require('https');
var NodeGeocoder = require('node-geocoder'); 
var geocoder = NodeGeocoder(options);


var app = express();
const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const MODEL_CODES = 'model-codes';
const CTX_FEATURES = 'features';
const CTX_MODEL_GRADE = 'model-grade';
const CTX_ZIP_CODE = 'zip-code';
const CTX_DEALER_CODE = 'dealer-code';
const CTX_MODEL_YEAR = 'model-year';
const OUT_CONTEXT = 'vehicle-info';
const USER_LOCATION_CONTEXT = 'user-location';
const PERMISSION_GRANTED = 'permission-granted';
const LATITUDE = "latitude";
const LONGITUDE = "longitude";
 
 
const App = require('actions-on-google').ApiAiApp;

var dealersObj = 
{
		dealerCode : '',
		name : '',
		address : '',
		city : '',
		state : '',
		zip : '',
		phone : '',
		distance : ''
		
};


		  
var headers = {
     'Content-Type':     'application/x-www-form-urlencoded'
}

var optionsInventory = {
	    host: 'www.toyota.com',
	    path: '/config/services/inventory/search/getInventory',
	    method: 'POST',
	    headers: headers
};


var options = {
		  provider: 'google',
		 
		  // Optional depending on the providers 
		  httpAdapter: 'https', // Default 
		  apiKey: 'AIzaSyAI5xmpF7_GxiTEDK1EaB09sP4W0nCjX3g',  
		  formatter: null          
		};
 

var optionsmlp = {
    host: 'www.toyota.com',
     path: '',
    headers: {'User-Agent': 'request'}
};

 var optionscs = {
    host: 'www.toyota.com',
    path: '/ToyotaSite/rest/lscs/getDocument?templatePath=templatedata/TComVehiclesData/Series/data/CombinedSeries.xml',
    headers: {'User-Agent': 'request'}
};

var optionsft = {
    host: 'www.toyota.com',
    path: '',
    headers: {'User-Agent': 'request'}
};

var optionsfym = {
	    host: 'www.toyota.com',
	    path: '/ToyotaSite/rest/lscs/getDocument?templatePath=templatedata/TComPageTemplates/FindYourMatch/data/FindYourMatch.xml',
	    headers: {'User-Agent': 'request'}
};

var optionsdealers = {
	    host: 'www.toyota.com',
	    path: '',
	    headers: {'User-Agent': 'request'}
	};


 
  
let modelInfoVoiceMsg = 'Sure I would love to talk about the ';
let mpgVoiceMsg = ' MPG rating is ';
  
exports.toyotaMotors = function (request, response) {
 
const app = new App({ request:request, response:response });
 
function getVehicleDetails(app)
{
 	
        let modelCode = app.getArgument('model-codes');
        let modelYear  = app.getArgument('model-year');
        
        const parameters = {};
  		parameters[MODEL_CODES] = modelCode;
  		parameters[CTX_MODEL_YEAR] = modelYear;
 	    app.setContext(OUT_CONTEXT, 50, parameters);
 	    
 	     
        
if(modelYear == null || modelYear == '')
{
		modelYear = 2017;
}

optionsmlp.path =  '/ToyotaSite/rest/lscs/getDocument?templatePath=templatedata/TComRefresh/MLP/data/'+ modelYear + '/' + modelCode + '.xml';
 
https.get(optionsmlp, function (res) {
    var json = '';
    res.on('data', function (chunk) {
        json += chunk;
    });
    res.on('end', function () {
        if (res.statusCode === 200) {
            try {
                var data = JSON.parse(json);
                // data is available here:
                 tdata = data.Root.MetaData.Description;
       		    app.ask(modelInfoVoiceMsg + modelCode + ' ' + modelYear + '.' +  tdata);
       		 //app.ask(app.buildRichResponse().addSimpleResponse(modelInfoVoiceMsg + modelCode + ' ' + modelYear + '.' +  tdata).addBasicCard(app.buildBasicCard('Camry 2017.').setTitle('Camry 2017').setImage('https://www.toyota.com/imgix/responsive/images/mlp/models/2017/camry/camry_xse_v6-side.png', 'Camry 2017')
//       			    )
//       			  );
       		    
            } catch (e) {
                console.log('Error parsing JSON!');
            }
        } else {
            console.log('Status:', res.statusCode);
        }
    });
}).on('error', function (err) {
      console.log('Error:', err);
});
 
 
}

 
function getCombinedSeriesDataForModel(app)
{
        let modelCode = app.getArgument('model-codes');
        let modelYear  = app.getArgument('model-year');
        let combinedSeriesOption  = app.getArgument('combined-series-options');
		var combinedSeriesData = 'No data'; 
 
 
 		const parameters = {};
  		parameters[MODEL_CODES] = modelCode;
  		parameters[CTX_MODEL_YEAR] = modelYear;
 	    app.setContext(OUT_CONTEXT, 50, parameters);
 	    
if(modelYear == null || modelYear == '')
{	

	modelYear = 2017;

}
 
  
https.get(optionscs, function (res) {
    var json = '';
    res.on('data', function (chunk) {
        json += chunk;
    });
    res.on('end', function () {
        if (res.statusCode === 200) {
            try {
                var data = JSON.parse(json);
                // data is available here:
          for (var int = 0; int < data.Root.Series.length; int++) 
                {
                	
                	var modelCodeCS =  data.Root.Series[int].modelCode;
                	var modelYearCS =  data.Root.Series[int].modelYear;

                	if(modelCode == modelCodeCS && modelYear == modelYearCS)
                { 
   
			if(combinedSeriesOption == 'mpg')
			{
				combinedSeriesData =  mpgVoiceMsg + data.Root.Series[int].cityMPG + '/' + data.Root.Series[int].hwyMPG; 
			}	
			else if(combinedSeriesOption == 'base-msrp')
			{
				
                		combinedSeriesData = '$' + data.Root.Series[int].BaseMsrp;
			}
			else if(combinedSeriesOption == 'engine')
			{
				
                		combinedSeriesData = data.Root.Series[int].Engine;
			}
			else
			{
								
                		combinedSeriesData = ' No data ';
			}
			app.ask('Got ' + modelCode + ' ' + modelYear +  ' and '  + combinedSeriesOption + ' as ' + combinedSeriesData);
 		   break;

                		}
			
	             	}       
           }
             catch (e) {
                console.log('Error parsing JSON!');
            }
        } else {
            console.log('Status:', res.statusCode);
        }
    });
}).on('error', function (err) {
      console.log('Error:', err);
});

 
 
}
 

function getCombinedSeriesDataForModelQuery(app)
{
 		 let context = app.getContext(OUT_CONTEXT);
         let modelCode = context.parameters[MODEL_CODES];
         let features =context.parameters[CTX_FEATURES];
         let modelYear  = context.parameters[CTX_MODEL_YEAR];
         let combinedSeriesOption  = app.getArgument('combined-series-options');
		 var combinedSeriesData = 'No data'; 
		 let modelgrade = context.parameters[CTX_MODEL_GRADE];
  
 
if(modelYear == null || modelYear == '')
	{	
	
		modelYear = 2017;

	}
	
	  

https.get(optionscs, function (res) {
    var json = '';
 
    res.on('data', function (chunk) {
        json += chunk;
    });
    res.on('end', function () {
        if (res.statusCode === 200) {
            try {
                var data = JSON.parse(json);
                // data is available here:
               

          for (var int = 0; int < data.Root.Series.length; int++) 
                {
                	
                	var modelCodeCS =  data.Root.Series[int].modelCode;
                	var modelYearCS =  data.Root.Series[int].modelYear;
                  	if(modelCode == modelCodeCS && modelYear == modelYearCS)
                	
                {
 
			if(combinedSeriesOption == 'mpg')
			{
				combinedSeriesData = mpgVoiceMsg + data.Root.Series[int].cityMPG + '/' + data.Root.Series[int].hwyMPG; 
			}	
			else if(combinedSeriesOption == 'base-msrp')
			{
				
                		combinedSeriesData = '$' + data.Root.Series[int].BaseMsrp;
			}
			else if(combinedSeriesOption == 'engine')
			{
				
                		combinedSeriesData = data.Root.Series[int].Engine;
			}
			else
			{
								
                		combinedSeriesData = ' No data ';
			}
			app.ask('The ' + combinedSeriesOption + ' for ' + modelCode + ' ' + modelYear + ' is '  + combinedSeriesData);
 		   break;

                }
          }
           	
 } catch (e) {
                console.log('Error parsing JSON!');
            }
        } else {
            console.log('Status:', res.statusCode);
        }
    });
}).on('error', function (err) {
      console.log('Error:', err);
});

	 
 
}

function getVehicleWithFeatures(app)
{

         let modelCode =app.getArgument('model-codes');
         let modelYear  = app.getArgument('model-year');
         var ipfeaturesList  = app.getArgument('features');
         
         const parameters = {};
   		 parameters[CTX_FEATURES] = ipfeaturesList;
  	     app.setContext(OUT_CONTEXT, 50, parameters);
  		 
 
if(modelYear == null || modelYear == '')
	{	
	
		modelYear = 2017;

	}
	
optionsft.path =  '/ToyotaSite/rest/lscs/getDocument?templatePath=templatedata/TComVehiclesData/VehicleTrim/data/'+ modelYear + '/' + modelCode + '.xml';
//optionsft.path =  '/content/fso/data/vehicles/'+ modelYear + '/' + modelCode +'/exterior.json';
	 
   
	https.get(optionsft, function (res) {
	    var json = '';
	 
	    res.on('data', function (chunk) {
	        json += chunk;
	    });
	    res.on('end', function () {
	        if (res.statusCode === 200) {
	            try {
	                            

	                 var data = JSON.parse(json);
	                 
	                                 

	                // data is available here:
	                 
	var modelGrade = '';
	var doesModelHaveFeature = false;
	var featureName = '';
	  for (i= 0; i < data.Root.ModelGrades.length; i++) 
	                {
	                    							
	                    modelGrade = modelCode + ' ' + modelYear + ' ' + data.Root.ModelGrades[i].modelGradeName;
						var keyFeaturesArray = data.Root.ModelGrades[i].KeyFeatures;
	                	
	                	for (j = 0; j < keyFeaturesArray.length; j++) 
	                	{ 
	                		for(k=0;k<ipfeaturesList.length;k++)
	                			{
	                			var doesContains = keyFeaturesArray[j].Feature.indexOf(ipfeaturesList[k]);

	    						if(doesContains != -1)
	    						{
	    							doesModelHaveFeature = true;
	    							featureName = featureName + ',' + ipfeaturesList[k] ;
	    						}
	                			
	    					 }
	 					}
	                	if(doesModelHaveFeature)
	                		{
	                			parameters[CTX_MODEL_GRADE] = data.Root.ModelGrades[i].modelGradeName;;
	                			app.setContext(OUT_CONTEXT, 50, parameters);
	                			app.ask('The feature ' + featureName + ' is available for model/grade ' + modelGrade.toUpperCase());
	                			break;
	                		}
						
	    		}
	  
						  if(!doesModelHaveFeature)
							{
								 
								app.ask('The feature(s) are not available for model ' + modelCode + ' ' + modelYear );
								 
							}
	 		}
	             catch (e) {
	                console.log('Error parsing JSON!');
	            }
	        } else {
	            console.log('Status:', res.statusCode);
	        }
	    });
	}).on('error', function (err) {
	      console.log('Error:', err);
	});
    
}
 
function addVehicleFeatures(app)
{
	
	 let context = app.getContext(OUT_CONTEXT);
     let modelCode =context.parameters[MODEL_CODES];
     
     let oldFeatures = app.getArgument('oldfeatures');
     let newFeatures =app.getArgument('features');
     let modelYear  = context.parameters[CTX_MODEL_YEAR];

     var ipfeaturesList  = newFeatures.concat(oldFeatures);
     
     const parameters = {};
	 parameters[CTX_FEATURES] = ipfeaturesList;
	 app.setContext(OUT_CONTEXT, 50, parameters);

if(modelYear == null || modelYear == '')
{	

	modelYear = 2017;

}

optionsft.path =  '/ToyotaSite/rest/lscs/getDocument?templatePath=templatedata/TComVehiclesData/VehicleTrim/data/'+ modelYear + '/' + modelCode + '.xml';
 	  
	https.get(optionsft, function (res) {
	    var json = '';
	 
	    res.on('data', function (chunk) {
	        json += chunk;
	    });
	    res.on('end', function () {
	        if (res.statusCode === 200) {
	            try {
 	                 var data = JSON.parse(json);
	 
	                // data is available here:
	                 
	var modelGrade = '';
	var doesModelHaveFeature = false;
	var featureName = '';
	  for (i= 0; i < data.Root.ModelGrades.length; i++) 
	                {
	                    							
	                    modelGrade = modelCode + ' ' + data.Root.ModelGrades[i].modelGradeName;
						var keyFeaturesArray = data.Root.ModelGrades[i].KeyFeatures;
	                	
	                	for (j = 0; j < keyFeaturesArray.length; j++) 
	                	{ 
	                		for(k=0;k<ipfeaturesList.length;k++)
	                			{
	                			var doesContains = keyFeaturesArray[j].Feature.indexOf(ipfeaturesList[k]);

	    						if(doesContains != -1)
	    						{
	    							doesModelHaveFeature = true;
	    							featureName = featureName + ',' + ipfeaturesList[k] ;
	                 			}
	                			
	    					 }
	 					}
	                	if(doesModelHaveFeature)
	                		{
	                			parameters[CTX_MODEL_GRADE] = data.Root.ModelGrades[i].modelGradeName;;
	                			app.setContext(OUT_CONTEXT, 50, parameters);
	                			app.ask('The added features ' + featureName + ' is available for model and grade ' + modelGrade);
 	                			break;
	                		}
						
	    		}
						  				
						  if(!doesModelHaveFeature)
							{
								 
								app.ask('The added features are not available for model ' + modelCode);
								 
							}
	  
	 		}
	             catch (e) {
	                console.log('Error parsing JSON!');
	            }
	        } else {
	            console.log('Status:', res.statusCode);
	        }
	    });
	}).on('error', function (err) {
	      console.log('Error:', err);
	});
 
}


function getModelGradeInfo(app)
{
 
	let context = app.getContext(OUT_CONTEXT);
    let modelCode =context.parameters[MODEL_CODES];
    let ipModelGrade = context.parameters[CTX_MODEL_GRADE];
    
    let modelGradeParam =app.getArgument('model-grade-param');
    let modelYear  = context.parameters[CTX_MODEL_YEAR];
    var modelGradeInfo = '';
 
if(modelYear == null || modelYear == '')
{	

	modelYear = 2017;

}

optionsft.path =  '/ToyotaSite/rest/lscs/getDocument?templatePath=templatedata/TComVehiclesData/VehicleTrim/data/'+ modelYear + '/' + modelCode + '.xml';
   
	https.get(optionsft, function (res) {
	    var json = '';
	 
	    res.on('data', function (chunk) {
	        json += chunk;
	    });
	    res.on('end', function () {
	        if (res.statusCode === 200) {
	            try {
	                 var data = JSON.parse(json);
	 
	                // data is available here:
	                 
	var modelGrade = '';
 	  for (i= 0; i < data.Root.ModelGrades.length; i++) 
	                { 
	 	  					modelGrade =  data.Root.ModelGrades[i].modelGradeName;
		  					if(modelGrade == ipModelGrade)
		  						{
	  							if(modelGradeParam == 'base-msrp')
	  								{
	  								modelGradeInfo = '$' + data.Root.ModelGrades[i].VehicleTrims[0].msrp;
	  								}
		  							else if(modelGradeParam == 'engine')
	  								{
		  								modelGradeInfo = data.Root.ModelGrades[i].VehicleTrims[0].Engine;

	  								}
		  							else if(modelGradeParam == 'mpg')
	  								{
		  								modelGradeInfo = data.Root.ModelGrades[i].VehicleTrims[0].cityMPG + '/' +  data.Root.ModelGrades[i].VehicleTrims[0].hwyMPG;

	  								}
	  							
	  							app.ask('Got ' + modelGradeParam + ' for ' + modelCode + ' ' +  modelGrade + ' as '  + modelGradeInfo);
	  				 		    break;
		  						}

	                }
	 		}
	             catch (e) {
	                console.log('Error parsing JSON!');
	            }
	        } else {
	            console.log('Status:', res.statusCode);
	        }
	    });
	}).on('error', function (err) {
	      console.log('Error:', err);
	});
 

}


function permissionChecker(app) 
{
 
			
			let userLocationCtx = app.getContext(USER_LOCATION_CONTEXT);
			 
			let permissionGranted =userLocationCtx.parameters[PERMISSION_GRANTED];
 			 
 			if(null == permissionGranted || permissionGranted != "1")
 				{
 					const permission = app.SupportedPermissions.DEVICE_PRECISE_LOCATION;
 					app.data.permission = permission;
					app.askForPermission('Please let us know your current location.', permission);
				}
 			else 
 		     {
 		    	 	 let userLocationCtx = app.getContext(USER_LOCATION_CONTEXT);
 		 			 latitude =userLocationCtx.parameters[LATITUDE];
 		 			 longitude =userLocationCtx.parameters[LONGITUDE];    
 		 			 
 			
 			geocoder.reverse({lat:latitude, lon:longitude}, function(err, res)
 				    {
 				    	 var zipCode = res[0].zipcode;
 				    	 getDealersByZipCode(zipCode,app);
 					 });
 		     }
 		 
}


function gotPermission(app) {
	
 	var latitude = '';
	var longitude = '';
 
	let userLocationCtx = app.getContext(USER_LOCATION_CONTEXT);
	let permissionGranted =userLocationCtx.parameters[PERMISSION_GRANTED];
 	if (app.isPermissionGranted() || permissionGranted == "1")
      {
    	const parameters = {};
		parameters[PERMISSION_GRANTED] = "1";
		app.setContext(USER_LOCATION_CONTEXT, 50, parameters);
		
		let deviceCoordinates = app.getDeviceLocation().coordinates;
		latitude =deviceCoordinates.latitude;
		longitude = deviceCoordinates.longitude;
		 
		parameters[LONGITUDE] = longitude;
		parameters[LATITUDE] = latitude;
 		app.setContext(USER_LOCATION_CONTEXT, 50, parameters);
    	 
    	 
     }  
	geocoder.reverse({lat:latitude, lon:longitude}, function(err, res)
		    {
		    	 var zipCode = res[0].zipcode;
		    	 getDealersByZipCode(zipCode,app);
			 });

}



 

function getDealersByZipCode(zipCode,app)
{

var dealerArray = new Array(5);	
var name = '';	
var address = '';
var city = '';
var state = '';
var zip = '';
var phone = '';
var distance = '';

 
optionsdealers.path =  '/ToyotaSite/rest/dealerLocator/locateDealers?brandId=1&zipCode='+zipCode+'&source=SIT';
	  
	https.get(optionsdealers, function (res) {
	    var json = '';
	 
	    res.on('data', function (chunk) {
	        json += chunk;
	    });
	    res.on('end', function () {
	        if (res.statusCode === 200) {
	            try {
	                 	var data = JSON.parse(json);
                   
	  					dealersObj.dealerCode = data.dealers[0].code;
 	  					dealersObj.name = data.dealers[0].name;
 		  				dealersObj.address = data.dealers[0].address1;
  		  				dealersObj.city = data.dealers[0].city;
 		  				dealersObj.state = data.dealers[0].state;
  		  				dealersObj.zip = data.dealers[0].zip;
 		  				dealersObj.phone = data.dealers[0].phone;
  		  				dealersObj.distance = data.dealers[0].distance + ' miles';
  		  				
  		  				const parameters = {};
  		  				parameters[CTX_ZIP_CODE] = zipCode;
  		  				parameters[CTX_DEALER_CODE] = dealersObj.dealerCode;
  		  				app.setContext(OUT_CONTEXT, 50, parameters);
  		  				
     		  			app.ask('The nearest dealer from your current location is ' +  dealersObj.name + '  address:- ' +  dealersObj.address + ' and distance ' + dealersObj.distance);
 
	 		}
	             catch (e) {
	                console.log('Error parsing JSON!');
	            }
	        } else {
	            console.log('Status:', res.statusCode);
	        }
	    });
	}).on('error', function (err) {
	      console.log('Error:', err);
	});
	 
}



function getDealersNearMeByZipcode(app)
{
 
	var dealerArray = new Array(5);	
	var name = '';	
	var address = '';
	var city = '';
	var state = '';
	var zip = '';
	var phone = '';
	var distance = '';

	let zipCode =app.getArgument('zip-code');
	if(null == zipCode)
	{
		 //app.ask('Please specify your Zip-Code');
         zipCode = '22102';
	}
  
	optionsdealers.path =  '/ToyotaSite/rest/dealerLocator/locateDealers?brandId=1&zipCode='+zipCode+'&source=SIT';
		  
		https.get(optionsdealers, function (res) {
		    var json = '';
		 
		    res.on('data', function (chunk) {
		        json += chunk;
		    });
		    res.on('end', function () {
		        if (res.statusCode === 200) {
		            try {
		                 	var data = JSON.parse(json);
	                   
		  					dealersObj.dealerCode = data.dealers[0].code;
	 	  					dealersObj.name = data.dealers[0].name;
	 		  				dealersObj.address = data.dealers[0].address1;
	  		  				dealersObj.city = data.dealers[0].city;
	 		  				dealersObj.state = data.dealers[0].state;
	  		  				dealersObj.zip = data.dealers[0].zip;
	 		  				dealersObj.phone = data.dealers[0].phone;
	  		  				dealersObj.distance = data.dealers[0].distance + ' miles';
	  		  				
	  		  				const parameters = {};
	  		  				parameters[CTX_ZIP_CODE] = zipCode;
	  		  				parameters[CTX_DEALER_CODE] = dealersObj.dealerCode;
	  		  				app.setContext(OUT_CONTEXT, 50, parameters);
	  		  				
	     		  			app.ask('The nearest dealer from your current location is ' +  dealersObj.name + '  address:- ' +  dealersObj.address + ' and distance ' + dealersObj.distance);
	 
		 		}
		             catch (e) {
		                console.log('Error parsing JSON!');
		            }
		        } else {
		            console.log('Status:', res.statusCode);
		        }
		    });
		}).on('error', function (err) {
		      console.log('Error:', err);
		});
		 
	 
}


function checkVehicleInventory(app)
{
  
		 let context = app.getContext(OUT_CONTEXT);
	     let dealerCode = context.parameters[CTX_DEALER_CODE];
	     let zipCode = context.parameters[CTX_ZIP_CODE];
	     let modelCode = context.parameters[MODEL_CODES];
	     let modelYear= context.parameters[CTX_MODEL_YEAR];
	     let modelGrade = context.parameters[CTX_MODEL_GRADE].toLowerCase();
	     let exteriorColors = app.getArgument('exteriorColors');
	     //var exteriorColorCode = '';
	 
	     if(modelYear == null || modelYear == '')
	     {	

	     	modelYear = 2017;
	     }
	     
	     if(null == dealerCode || '' == dealerCode)
	     {
	    	 app.ask('To check availablity of a model at a dealership please find your nearest dealer.');
	     }
	 
	     var post_data = '{"brand":"TOY","facetfields":[],"fields":[],"group":"true","groupfield":"","groupmode":"full","mode":"content","pagesize":"5","pagestart":"0","relevancy":"false","sortfield":"MSRP","sortorder":"ASC","show":{"accessory":{"derived":"false"}},"filter":{"year":["'+modelYear+'"],"series":["'+modelCode+'"],"model":[],"grade":["'+ modelGrade +'"],"enginetransmission":[],"bed":[],"cab":[],"exteriorcolor":[],"interiorcolor":[],"accessory":[],"packages":[],"andfields":["accessory","packages"],"dealers":["'+dealerCode+'"],"region":["800"]}}';
	     var modelColorMap = JSON.parse('{"camry_hybrid_xle":["040","089","1J9","1H1","4X7","218","221","3T3","8W7"],"camry_hybrid_se":["040","1J9","1H1","218","221","3T3","8T7"],"camry_xse":["089","1J9","1H1","218","221","3T3","8T7","8TT","1JJ","088"],"camry_xle_v6":["040","089","1J9","1H1","4X7","218","221","3T3","8W7"],"camry_hybrid_le":["040","1J9","1H1","4X7","218","221","3T3","8W7"],"camry_se":[{"Red":"040"},{"Black":"1J9"},{"White":"1H1"},{"Silver":"218"},{"Gray":"221"},{"Aqua":"3T3"},{"Blue":"8T7"}],"camry_xle":[{"Red":"040"},{"Black":"1J9"},{"White":"1H1"},{"Silver":"218"},{"Gray":"221"}],"camry_le":[{"Red":"040"},{"Black":"1J9"},{"White":"1H1"},{"Silver":"218"},{"Gray":"221"},{"Aqua":"3T3"},{"Blue":"8T7"}],"camry_l":["040","1J9","1H1","218","221"],"camry_xse_v6":["089","1J9","1H1","218","221","3T3","8T7","8TT","1JJ","088"]}');

	     if(exteriorColors != null && exteriorColors != '')
	    	 {
			     var modelGradeKey =  eval('modelColorMap.'+modelCode+"_"+modelGrade);
			     for(i=0;i<modelGradeKey.length;i++)
			    	{
			    	if(eval('modelColorMap.'+modelCode+"_"+modelGrade+'['+i+'].'+exteriorColors) != null)
			    		{
 			    			exteriorColorCode = '0'+ eval('modelColorMap.'+modelCode+"_"+modelGrade+'['+i+'].'+exteriorColors);
			    	 	    post_data =	'{"brand":"TOY","facetfields":[],"fields":[],"group":"true","groupfield":"","groupmode":"full","mode":"content","pagesize":"5","pagestart":"0","relevancy":"false","sortfield":"MSRP","sortorder":"ASC","show":{"accessory":{"derived":"false"}},"filter":{"year":["'+modelYear+'"],"series":["'+modelCode+'"],"model":[],"grade":["'+ modelGrade +'"],"enginetransmission":[],"bed":[],"cab":[],"exteriorcolor":["'+exteriorColorCode+'"],"interiorcolor":[],"accessory":[],"packages":[],"andfields":["accessory","packages"],"dealers":["'+dealerCode+'"],"region":["800"]}}';
			    			break;
			    		}
			    	}
	    }
	    
	     
	     var post_req  = null;

 	     var post_options = {
	     hostname: 'www.toyota.com',
	     port    : '443',
	     path    : '/config/services/inventory/search/getInventory',
	     method  : 'POST',
	     headers : {
	         'Content-Type': 'application/json',
	         'Cache-Control': 'no-cache',
	         'Content-Length': post_data.length
	     }
	 };

	 post_req = https.request(post_options, function (res) {
	      
	     res.setEncoding('utf8');
	     var json = '';
	     res.on('data', function (chunk) 
	    	{
	    	 json += chunk;
	         
	     });
	     res.on('end', function () {
		        if (res.statusCode === 200) {
		            try {
		                 	var data = JSON.parse(json);
	                   
 		                 	var isAvailable = data.body.response.numFound;
 		                 	var vehicleName = modelYear + " " + modelCode.toUpperCase() + " " + modelGrade.toUpperCase();
 		                 	if(isAvailable > 0)
 		                 		{
 		                 			(exteriorColors != null && exteriorColors != '') ? app.ask(vehicleName +  ' in color ' + exteriorColors + ' is available at this dealership.')  : app.ask(vehicleName + ' is available at this dealership.');
 		                 		}
 		                 	else
 		                 		{
 		                 			(exteriorColors != null && exteriorColors != '') ? app.ask(vehicleName + ' in color ' + exteriorColors + ' is not available at this dealership, at the moment.')  : app.ask(vehicleName + ' is not available at this dealership, at the moment.');
 		                 		}
	 	 			}
		             catch (e) {
		                console.log('Error parsing JSON!');
		            }
		        } else {
		            console.log('Status:', res.statusCode);
		        }
		    });

	 });
 
	 post_req.on('error', function(e) {
	     console.log('problem with request: ' + e.message);
	 });

 	 
	 post_req.write(post_data);
	  
	 
 }



function checkModelAvailability(app)
{
  
		 let context = app.getContext(OUT_CONTEXT);
	     let dealerCode = context.parameters[CTX_DEALER_CODE];
	     let zipCode = context.parameters[CTX_ZIP_CODE];
	     
	     let modelCode = (app.getArgument('model-codes') != null && app.getArgument('model-codes') !=  '') ? app.getArgument('model-codes')  : context.parameters[MODEL_CODES] ;
	     let modelYear=  app.getArgument('model-year') != null ? app.getArgument('model-year')  : context.parameters[CTX_MODEL_YEAR] ;
 	 
	     if(modelYear == null || modelYear == '')
	     {	

	     	modelYear = 2017;
	     }
	     
	     
	     if(null == dealerCode || '' == dealerCode)
	     {
	    	 app.ask('To check availablity of a model at a dealership please find your nearest dealer.');
	     }
	 
	     var post_data = '{"brand":"TOY","facetfields":[],"fields":[],"group":"true","groupfield":"","groupmode":"full","mode":"content","pagesize":"5","pagestart":"0","relevancy":"false","sortfield":"MSRP","sortorder":"ASC","show":{"accessory":{"derived":"false"}},"filter":{"year":["'+modelYear+'"],"series":["'+modelCode+'"],"model":[],"grade":[],"enginetransmission":[],"bed":[],"cab":[],"exteriorcolor":[],"interiorcolor":[],"accessory":[],"packages":[],"andfields":["accessory","packages"],"dealers":["'+dealerCode+'"],"region":["800"]}}';
 
	      console.log(post_data);
	      
	     var post_req  = null;

 	     var post_options = {
	     hostname: 'www.toyota.com',
	     port    : '443',
	     path    : '/config/services/inventory/search/getInventory',
	     method  : 'POST',
	     headers : {
	         'Content-Type': 'application/json',
	         'Cache-Control': 'no-cache',
	         'Content-Length': post_data.length
	     }
	 };

	 post_req = https.request(post_options, function (res) {
	      
	     res.setEncoding('utf8');
	     var json = '';
	     res.on('data', function (chunk) 
	    	{
	    	 json += chunk;
	         
	     });
	     res.on('end', function () {
		        if (res.statusCode === 200) {
		            try {
		                 	var data = JSON.parse(json);
	                   
 		                 	var isAvailable = data.body.response.numFound;
 		                 	var vehicleName = modelYear + " " + modelCode.toUpperCase();
 		                 	if(isAvailable > 0)
 		                 		{
 		                 			  app.ask(vehicleName + ' is available at this dealership.');
 		                 		}
 		                 	else
 		                 		{
 		                 			 app.ask(vehicleName + ' is not available at this dealership, at the moment.');
 		                 		}
	 	 			}
		             catch (e) {
		                console.log('Error parsing JSON!');
		            }
		        } else {
		            console.log('Status:', res.statusCode);
		        }
		    });

	 });
 
	 post_req.on('error', function(e) {
	     console.log('problem with request: ' + e.message);
	 });

 	 
	 post_req.write(post_data);
	  
	 
 }

 


function findYourMatch(app)
{
	app.ask('Let us help you find the perfect Toyota for you.Where are you headed? Off to Work or Out With Family or On An Adventure');

}

function queryHeadedToDestination(app)
{

    let destination = app.getArgument('answers');
    if(destination == 'off to work')
    	{
    		app.ask('What do you  plan to use the vehicle for? Commuting to work or Getting Work Done');
    	}
    else if(destination == 'out with family')
    	{
			app.ask('How much space does your family need?');

    	}
    else if(destination == 'On an Adventure')
    	{
			app.ask('What type of an adventure?');

    	}
    else
    {
		app.ask('Sorry didnt get what you just said.');

	}
}


function queryVehicleUsageForWork(app)
{
	let destination = app.getArgument('answers');
    if(destination == 'Commuting to work')
    	{
    		app.ask('Are you headed to work or school?');
    	}
    else if(destination == 'Getting Work Done')
    	{
			app.ask('What do you need most for work? Great Power Or Great Towing Or Great Milage');

    	}
   else
    {
		app.ask('Sorry, did"nt get what you just said.');

	}

}


function queryVehicleUsageForWorkOrSchool(app)
{
	let destination = app.getArgument('answers');
    if(destination == 'work')
    	{
    		app.ask('What is most important to you? Being Comfortable Or Being Efficient Or Being Economical');
    	}
    else if(destination == 'school')
    	{
			app.ask('How do you want to appear? Stylish Or Creative');

    	}
   else
    {
		app.ask('Sorry, did"nt get what you just said.');

	}

}



function queryVehicleUsageForWorkImportance(app)
{
	let destination = app.getArgument('answers');
    if(destination == 'Being Comfortable')
    	{
    		getMatchedVehicleForOffToWork('Being Comfortable');   
    	}
    else if(destination == 'Being Efficient')
    	{
    		getMatchedVehicleForOffToWork('Being Efficient');

    	}
     	 
	 
   else
    {
		app.ask('Sorry, did"nt get what you just said.');

	}
}



function queryVehicleUsageForWorkEconomy(app)
{

	let destination = app.getArgument('answers');
    if(destination == 'Space')
    	{
    		getMatchedVehicleForOffToWork('Space');
    	}
    else if(destination == 'Efficiency')
    	{
			getMatchedVehicleForOffToWork('Efficiency');

    	}
   else
    {
		app.ask('Sorry, did"nt get what you just said.');

	}
 
}

function queryVehicleUsageForBeingEconomical(app)
{
	let destination = app.getArgument('answers');
    if(destination == 'Being Economical')
    	{
    		app.ask('What matters most on a long trip? Space or Efficiency');

     	}
   else
    {
		app.ask('Sorry, did"nt get what you just said.');

	}

}
 

function getMatchedVehicleForOffToWork(criteria)
{
	   
  
https.get(optionsfym, function (res) {
var json = '';
var matcheddata = '';
res.on('data', function (chunk) {
    json += chunk;
});
res.on('end', function () {
    if (res.statusCode === 200) {
        try {
            var data = JSON.parse(json);
            // data is available here:
            if(criteria == 'Being Comfortable')
        	{
        		matcheddata = data.Root.options[0].options[0].options[0].options[0].results;
        	}
            else if(criteria == 'Being Efficient')
        	{
        		matcheddata = data.Root.options[0].options[0].options[0].options[1].results;
        	}
            else if(criteria == 'Space')
        	{
        		matcheddata = data.Root.options[0].options[0].options[0].options[2].options[0].results;
        	}
            else if(criteria == 'Efficiency')
        	{
        		matcheddata = data.Root.options[0].options[0].options[0].options[2].options[1].results;
        	}
            else
            	{
            	matcheddata = 'No data found';
            	}
   		    app.ask('Your matched vehicle(s) ' + matcheddata);

        } catch (e) {
            console.log('Error parsing JSON!');
        }
    } else {
        console.log('Status:', res.statusCode);
    }
});
}).on('error', function (err) {
  console.log('Error:', err);
});
 

}


function quitApp(app)
{
	
	app.tell('OK.Come back next time to know about new Toyota models.');

}
 
				const actionMap = new Map();
 			    actionMap.set('model.info',getVehicleDetails);
       		    actionMap.set('combinedseries.model',getCombinedSeriesDataForModel);
                actionMap.set('cs.query',getCombinedSeriesDataForModelQuery);
                actionMap.set('findVehicle.features',getVehicleWithFeatures);
                actionMap.set('addVehicle.features',addVehicleFeatures);
                actionMap.set('findModelGrade.info',getModelGradeInfo);               
                actionMap.set('dealer.requested', permissionChecker);
                actionMap.set('locate-dealer.locate-dealer-fallback', gotPermission);
                actionMap.set('check.inventory', checkVehicleInventory);
                actionMap.set('check.model.availability', checkModelAvailability);
                actionMap.set('dealerby.zipcode', getDealersNearMeByZipcode);
                
                
                actionMap.set('find.match', findYourMatch);
                actionMap.set('where.headed.to', queryHeadedToDestination);
                actionMap.set('vehicle.usage.work', queryVehicleUsageForWork);
                actionMap.set('vehicle.usage.work.school', queryVehicleUsageForWorkOrSchool);
                actionMap.set('vehicle.usage.work.importance', queryVehicleUsageForWorkImportance);
                actionMap.set('vehicle.usage.for.economy', queryVehicleUsageForWorkEconomy);
                actionMap.set('vehicle.usage.for.being.economical', queryVehicleUsageForBeingEconomical);
                actionMap.set('quit.app', quitApp);
                app.handleRequest(actionMap);
          
}
 