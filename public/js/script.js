
var tooltip = d3.select("body").append("div").attr("class", "tooltip");

var anio = $("#anios").val();


var datos = [];

var color = d3.scale.linear().domain([1, 200]).range(["#6de000", "#6de044"]);


var width = 650,
        height = 500;

var radius = d3.scale.sqrt()
        .domain([0, 200])
        .range([0, 200]);

//Map projection
var projection = d3.geo.mercator()
        .scale(1200)
        .center([-74.991903, -9.314378388527897]) //projection center
        .translate([width / 2, height / 2]) //translate to center the map in view

//Generate paths based on projection
var path = d3.geo.path()
        .projection(projection);

$().ready(function() {

    $("#anios").change(function() {
        initMap($(this).val());
    });

    d3.csv("datos/beneficiarios_progrma_juntos.csv", function(error, data) {
        data.forEach(function(d) {
            datos[d.id] = d;
        });
    });

    initMap(anio);

});

function initMap(anio) {

    $("#map_container_svg").fadeOut(100, function() {

        $(this).html("");

        $("#map_container_svg").fadeIn(100, function() {

            //svg
            var svg = d3.select("#map_container_svg").append("svg")
                    .attr("width", width)
                    .attr("height", height);


            var features = svg.append("g")
                    .attr("class", "features");

            d3.json("regiones_peru_topo.json", function(error, geodata) {

                //Create a path for each map feature in the data
                features.selectAll("path")
                        .data(topojson.feature(geodata, geodata.objects.regiones_peru).features) //generate features from TopoJSON
                        .enter()
                        .append("path")
                        .attr("d", path)
                        .style("fill", function(d) {
                    if (datos[d.id][anio] != 0) {
                        var vr = datos[d.id][anio] / 100000;
                        return color(vr);
                    } else {
                        return '#cecece';
                    }
                })
                        .on("mousemove", moveTooltip)
                        .on("mouseout", hideTooltip);

                features.append("g")
                        .attr("class", "bubble")
                        .selectAll("circle")
                        .data(topojson.feature(geodata, geodata.objects.regiones_peru).features
                        .sort(function(a, b) {
                    return datos[b.id][anio] - datos[a.id][anio];
                })).enter().append("circle").attr("transform", function(d) {
                    if (datos[d.id][anio] != 0) {
                        return "translate(" + path.centroid(d) + ")";
                    }
                }).attr("r", function(d) {
                    return radius(datos[d.id][anio] / 100000);
                }).on("mouseover", showTooltip);

            });
        });
    });

}


var tooltipOffset = {x: 5, y: -25};


function showTooltip(d) {
    if (datos[d.id][anio] != 0) {
        moveTooltip();
        tooltip.style("display", "block").html(d.properties.name + "<br /> Número Beneficiarios: " + datos[d.id][anio]);
    }
}

function moveTooltip() {
    tooltip.style("top", (d3.event.pageY + tooltipOffset.y) + "px")
            .style("left", (d3.event.pageX + tooltipOffset.x) + "px");
}

//Create a tooltip, hidden at the start
function hideTooltip() {
    tooltip.style("display", "none");
}
