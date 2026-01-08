/// Define the area of interest
var aoi = ee.FeatureCollection('projects/gee-trial2/assets/Climatics_Zone_Shapefiles/IND_Agro_Climatic_Regions')
                                            .filter(ee.Filter.eq('regionco_1', 8));
Map.centerObject(aoi);
//-----------------------------------------------------------------------
// Set study period
var startyear = 2015; 
var endyear = 2024;
var startmonth = 1; 
var endmonth = 12; 

// Compute beginning & end of study period + sequence of months & years
var start_date = ee.Date.fromYMD(startyear, startmonth, 1);
var end_date = ee.Date.fromYMD(endyear , endmonth, 30);
var years = ee.List.sequence(startyear, endyear);
var months = ee.List.sequence(startmonth, endmonth);
//-------------------------------------------------------------------
// Load monthly precipitation and PET datasets (e.g., CHIRPS for precipitation and TerraClimate for PET).
var precip = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                                  .filterBounds(aoi)
                                  .filterDate(start_date, end_date)
                                  .select('precipitation');
var pet = ee.ImageCollection("IDAHO_EPSCOR/TERRACLIMATE")
                                  .filterBounds(aoi)
                                  .filterDate(start_date, end_date)
                                  .select('pet');

print ('precip', precip)
print ('pet', pet)
//----------------------------------------------------------------
// Function to calculate monthly sum for each month
var calculateMonthlySum = function(imageCollection, bandName) {
  return ee.ImageCollection(
    ee.List.sequence(1, 12).map(function(month) {
      var monthly = imageCollection
        .filter(ee.Filter.calendarRange(month, month, 'month'))
        .sum()
        .set('month', month);
      return monthly.rename(bandName + '_monthly');
    })
  );
};

// Calculate monthly precipitation and PET sums
var precipMonthly = calculateMonthlySum(precip, 'precipitation');
var petMonthly = calculateMonthlySum(pet, 'pet');
//------------------------------------------------------------------

// Calculate monthly water balance (D = P - PET)
var waterBalance = precipMonthly.map(function(image) {
  var month = image.get('month');
  var petImage = petMonthly.filter(ee.Filter.eq('month', month)).first();
  return image.subtract(petImage).rename('water_balance').set('month', month);
});

//--------------------------------------------------------------------------
// Placeholder function for standardization (normally fitting to a distribution is needed)
// Here we assume a simpler normalization for demonstration purposes.
var standardize = function(image) {
  var mean = ee.Image(waterBalance.reduce(ee.Reducer.mean()));
  var stdDev = ee.Image(waterBalance.reduce(ee.Reducer.stdDev()));
  return image.subtract(mean).divide(stdDev).rename('SPEI');
};

// Apply the standardization function
var speiCollection = waterBalance.map(standardize);
print ('speiCollection' , speiCollection) 

//----------------------------------------------------------------------
// Filter the collection to the first three months of the year
var SPEI_Months = speiCollection.filter(ee.Filter.calendarRange(1, 12, 'month'));
//print('Filtered SPEI Collection (Jan-Mar)',  SPEI_Months);

var speiClipped = speiCollection.map(function(img) {
  return img.clip(aoi);
});

Map.addLayer(speiClipped.mean(),
  {min: -2,
  max: 1.5,
  palette: ['#d73027', '#fc8d59', '#fee08b','#d9ef8b' ,'#91cf60' ,'#1a9850']},
  'Mean SPEI');

// Export the mean soil moisture image to Google Drive
Export.image.toDrive({
  image: SPEI_Months.mean().clip(aoi),
  description: 'SPEI',
  scale: 250,
  region: aoi,
  maxPixels: 8e13,
  fileFormat: 'GeoTIFF'
});

// =========================================
// SPEI Legend (Drought Severity)
// =========================================

var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 12px',
    backgroundColor: 'white'
  }
});

// Legend Title
legend.add(ui.Label({
  value: 'SPEI (Drought Index)',
  style: {
    fontWeight: 'bold',
    fontSize: '14px',
    margin: '0 0 6px 0'
  }
}));

// Function to create legend row
var makeRow = function(color, label) {
  return ui.Panel({
    widgets: [
      ui.Label({
        style: {
          backgroundColor: color,
          padding: '8px',
          margin: '0 8px 4px 0'
        }
      }),
      ui.Label({
        value: label,
        style: { margin: '0 0 4px 0' }
      })
    ],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

// SPEI Classes
legend.add(makeRow('#d73027', 'Extreme Drought (≤ -2.0)'));
legend.add(makeRow('#fc8d59', 'Severe Drought (-1.5 to -2.0)'));
legend.add(makeRow('#fee08b', 'Moderate Drought (-1.0 to -1.5)'));
legend.add(makeRow('#d9ef8b', 'Near Normal (-1.0 to 1.0)'));
legend.add(makeRow('#91cf60', 'Moderately Wet (1.0 to 1.5)'));
legend.add(makeRow('#1a9850', 'Very Wet (≥ 1.5)'));

// Add legend to map
Map.add(legend);
