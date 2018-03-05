//Leaflet Demo Recording

function createMap() {  
    var map = L.map('map', {
        center: [40.2, -95.5],
        zoom: 3,
        layers: grayscale,
        minZoom: 4,
        maxZoom: 10,
        trackResize: true,
        dragging: true,
        doubleClickZoom: true,
        boxZoom: true,
        
        zoomControl: true
    
    });

    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/nobrien33/cje8r17ouaf2d2sntjewubp6i/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibm9icmllbjMzIiwiYSI6ImNqZTdmNTV1NjAxYWMyeHFwbjI4ZmI2OWsifQ.Bw4VJI6HqHyqiPIzZ2bFdQ',{
        attribution: 'Basemap Created using Mapbox',
    
            minZoom: 3,
            maxZoom: 14
    
    }).addTo(map);
    
    var RoadMap = L.tileLayer('https://api.mapbox.com/styles/v1/nobrien33/cjeesyjpr48zl2rozf7f9uj63/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoibm9icmllbjMzIiwiYSI6ImNqZTdmNTV1NjAxYWMyeHFwbjI4ZmI2OWsifQ.Bw4VJI6HqHyqiPIzZ2bFdQ',{
       attribution: 'Basemap Created using Mapbox',
    
            minZoom: 3,
            maxZoom: 14         
    }).addTo(map);
    
    getData(map);
    
  var baseMaps = {
    "Grayscale": grayscale,
    "Road Map": RoadMap
};

L.control.layers(baseMaps).addTo(map);  
    

}


    
function calcPropRadius(attValue) {
    var scaleFactor = 5;
    var area = attValue * scaleFactor;
    var radius = Math.sqrt(area/Math.PI);
    return radius;
};
    
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "yr_2015";
    console.log(attribute);

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.NAME + "</p>";
    var year = attribute.split("_")[1];
    popupContent +="<p><b>Auto Thefts " + year + ":</b> " + feature.properties[attribute] + " per 100,000</p>";
    //bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#panel").html(popupContent);
        }
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
   L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};    
    

function createSequenceControls(map){
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step:1
    });
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    
};
    
   

    function getData(map){
        $.ajax("js/AutoTheft.geojson", {
            dataType: "json",
            success: function(response){
                var attributes = processData(response);
                createPropSymbols(response, map);
                createSequenceControls(map);
            }
        });
    }
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("yr_") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};





$(document).ready(createMap);




