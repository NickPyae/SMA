angular.module('SMARTLobby.directives', [])
  .directive('visitorStatsComponent',function() {
    return {
      templateUrl: 'templates/visitor-stats-component.html'
    };
  })
  .directive('visitorComponent',function() {
    return {
      templateUrl: 'templates/visitor-component.html'
    };
  })
  .directive('visitorDividerComponent',function() {
    return {
      templateUrl: 'templates/visitor-divider-component.html'
    };
  })
  .directive('clickToRevealOptionComponent', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        scope.$on('visitorStatusHasUpdated', function (event, args) {
          revealOptionComponent();
        });

        element.bind('click', function (e) {
          e.stopPropagation();

          revealOptionComponent();
        });

        function revealOptionComponent() {
          angular.forEach(element.parent().parent().parent()[0].children, function (item) {

            // Grab individual content
            var content = item.querySelector('.item-content');

            // Grab the buttons and their width
            var buttons = item.querySelector('.item-options-left')

            if (!buttons) {
              return;
            }

            var buttonsWidth = buttons.offsetWidth;

            ionic.requestAnimationFrame(function () {
              content.style[ionic.CSS.TRANSITION] = 'all ease-out .25s';

              if (!buttons.classList.contains('invisible')) {
                content.style[ionic.CSS.TRANSFORM] = '';
                setTimeout(function () {
                  buttons.classList.add('invisible');
                }, 250);
              } else {
                buttons.classList.remove('invisible');
                content.style[ionic.CSS.TRANSFORM] = 'translate3d(+' + buttonsWidth + 'px, 0, 0)';
              }
            });
          });
        }
      }
    };
  })
  .directive('pieChartComponent', function (ContactStatusService, $state) {
    return {
      link: function (scope, element, attrs) {

        Chart.pluginService.register({
          afterDraw: function (chart, easing) {
            if (chart.config.options.showNumberOnSlice || chart.config.options.showLabel) {
              var self = chart.config;
              var ctx = chart.chart.ctx;

              ctx.font = '30px Oxygen';
              ctx.textAlign = 'center';
              ctx.fillStyle = '#fff';

              self.data.datasets.forEach(function (dataset, datasetIndex) {
                var total = 0, //total values to compute fraction
                  labelxy = [],
                  offset = Math.PI / 2, //start sector from top
                  radius,
                  centerx,
                  centery,
                  lastend = 0; //prev arc's end line: starting with 0

                //for (var val of dataset.data) { total += val; }

                for (val = 0; val < dataset.data.length; val++) {
                  total += dataset.data[val];
                }

                //TODO needs improvement
                var i = 0;
                var meta = dataset._meta[i];
                while (!meta) {
                  i++;
                  meta = dataset._meta[i];
                }

                var element;
                for (index = 0; index < meta.data.length; index++) {

                  element = meta.data[index];
                  radius = 0.9 * element._view.outerRadius - element._view.innerRadius;
                  centerx = element._model.x;
                  centery = element._model.y;
                  var thispart = dataset.data[index],
                    arcsector = Math.PI * (2 * thispart / total);
                  if (element.hasValue() && dataset.data[index] > 0) {
                    labelxy.push(lastend + arcsector / 2 + Math.PI + offset);
                  }
                  else {
                    labelxy.push(-1);
                  }
                  lastend += arcsector;
                }


                var lradius = radius * 3 / 4;
                for (var idx in labelxy) {
                  if (labelxy[idx] === -1) continue;
                  var langle = labelxy[idx],
                    dx = centerx + lradius * Math.cos(langle),
                    dy = centery + lradius * Math.sin(langle),
                    val = Math.round(dataset.data[idx] / total * 100);
                  if (chart.config.options.showNumberOnSlice)
                    ctx.fillText(dataset.data[idx], dx, dy);
                  else
                    ctx.fillText(chart.config.data.labels[idx], dx, dy);
                }
                ctx.restore();
              });
            }
          }
        });

        var pieChartConfig = {
          type: 'pie',
          data: {
            labels: [
              APP_CONFIG.CONTACT_STATUS.UNCONTACTED,
              APP_CONFIG.CONTACT_STATUS.NO_REPLY,
              APP_CONFIG.CONTACT_STATUS.VACATING,
              APP_CONFIG.CONTACT_STATUS.EVACUATED
            ],
            datasets: [{
              data: [40, 12, 20, 21],
              backgroundColor: [
                '#454242', //Gray
                '#FF0000', //Red
                '#FFC200', //Amber
                '#008000' //Green
              ],
              hoverBackgroundColor: [
                '#736F6E', //Light Gray
                '#f65656', //Light Red
                '#ffda66', //Light Amber
                '#4ca64c' //Light Green
              ]
            }]
          },
          options: {
            responsive: true,
            tooltips: {
              enabled: true,
            },
            legend: {
              position: 'top',
              onClick: function (event, legendItem) {
              },
              labels: {
                fontSize: 9
              }
            },
            showNumberOnSlice: true
          }
        };


        var pieChartCanvas = document.getElementById('pieChart').getContext('2d');
        var pieChart = new Chart(pieChartCanvas, pieChartConfig);

        document.getElementById('pieChart').onclick = function(evt)
        {
          var activePoints = pieChart.getElementsAtEvent(evt);

          if(activePoints.length > 0)
          {
            //get the internal index of slice in pie chart
            var clickedElementindex = activePoints[0]['_index'];

            //get specific label by index
            var label = pieChart.data.labels[clickedElementindex];

            ContactStatusService.setContactStatus(label);

            $state.go('tab.visitors');
          }
        }

      }
    };
  })
  .directive('comboChartComponent', function () {
    return {
      link: function (scope, element, attrs) {

        var randomScalingFactor = function () {
          return Math.round(Math.random() * 100);
        };

        var comboChartData = {
          labels: ['Before 9am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', 'After 7pm'],
          datasets: [{
            type: 'bar',
            label: 'In-building',
            backgroundColor: '#396191',
            data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), 80],
            borderColor: '#396191',
            pointBorderWidth: 2,
            pointBorderColor: '#396191',
            pointBackgroundColor: '#396191',
            fill: false
          }, {
            type: 'line',
            label: 'Checked-in',
            backgroundColor: '#604C7B',
            data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), 150],
            borderColor: '#604C7B',
            pointBorderWidth: 5,
            pointBorderColor: '#604C7B',
            pointBackgroundColor: '#604C7B',
            pointHoverRadius: 5,
            pointRadius: 1,
            pointHitRadius: 10,
            pointHoverBorderWidth: 5,
            lineTension: 0,
            fill: false
          },
            {
              type: 'bar',
              label: 'Checked-out',
              backgroundColor: '#CBC7CC',
              data: [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor()],
              borderColor: '#CBC7CC',
              pointBorderWidth: 2,
              pointBorderColor: '#CBC7CC',
              pointBackgroundColor: '#CBC7CC',
              fill: false
            }]
        };

        var comboChartCanvas = document.getElementById('comboChart').getContext('2d');
        var comboChart = new Chart(comboChartCanvas, {
          type: 'bar',
          data: comboChartData,
          options: {
            responsive: true,
            hoverMode: 'label',
            hoverAnimationDuration: 400,
            legend: {
              position: 'top',
              labels: {
                fontSize: 9
              }
            },
            tooltips: {
              mode: 'label'
            },
            scales: {
              xAxes: [{
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: 'Time at Site ' + '(' + new Date().toLocaleString() + ')'
                }
              }],
              yAxes: [{
                display: true,
                scaleLabel: {
                  display: true,
                  labelString: 'Number of Visitors'
                }
              }]
            },
            title: {
              display: true,
              text: 'Daily Visitor Checkin/out Momentum'
            }
          }
        });
      }
    };
  })

