var calendarDemoApp = angular.module('calendarDemoApp', ['ui.calendar', 'ui.bootstrap', 'ngAnimate', 'ngMaterial', 'ngMessages', 'material.svgAssetsCache', 'angularModalService', 'toastr', "ngTable"]);

calendarDemoApp.controller('CalendarCtrl',
    function ($scope, $compile, $timeout, uiCalendarConfig, ModalService, $interval, $templateCache, $http) {
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        var Day = {
            SUNDAY: 0,
            MONDAY: 1,
            TUESDAY: 2,
            WEDNESDAY: 3,
            THURSDAY: 4,
            FRIDAY: 5,
            SATURDAY: 6
        };

        $scope.curScheduleInfo = {
            fullName: localStorage.getItem("curScheduleFullName"),
            components: localStorage.getItem("curScheduleComponents"),
            scheduleSelected: false
        };

        $scope.schedules = localStorage.getItem("cachedSchedules");
        $scope.schedules = $scope.schedules ? JSON.parse($scope.schedules) : [];

        $scope.curScheduleInfo.fullName = "";
        $scope.curScheduleInfo.components = [];

        $scope.events = [];

        $scope.curScheduleInfo.components.forEach(function(component){
            var daysArr = [];
            component.days.forEach(function(day){
                if(day && day.toLowerCase){
                    switch(day.toLowerCase()){
                        case "monday":
                            if(daysArr.indexOf(Day.MONDAY) == -1) daysArr.push(Day.MONDAY);
                            break;
                        case "tuesday":
                            if(daysArr.indexOf(Day.TUESDAY) == -1) daysArr.push(Day.TUESDAY);
                            break;
                        case "wednesday":
                            if(daysArr.indexOf(Day.WEDNESDAY) == -1) daysArr.push(Day.WEDNESDAY);
                            break;
                        case "thursday":
                            if(daysArr.indexOf(Day.THURSDAY) == -1) daysArr.push(Day.THURSDAY);
                            break;
                        case "friday":
                            if(daysArr.indexOf(Day.FRIDAY) == -1) daysArr.push(Day.FRIDAY);
                            break;
                        case "saturday":
                            if(daysArr.indexOf(Day.SATURDAY) == -1) daysArr.push(Day.SATURDAY);
                            break;
                        case "sunday":
                            if(daysArr.indexOf(Day.SUNDAY) == -1) daysArr.push(Day.SUNDAY);
                            break;
                    }
                }
            });

            $scope.eventSources[0] = $scope.eventSources[0].concat(
                createArrOfEventsForCourseComponent(component.name.substring(
                    $scope.curScheduleInfo.fullName.length + 1),
                    [
                        {
                            startTime: (component.startTime + 12) * 60,
                            endTime: (component.endTime + 12) * 60,
                            days: daysArr
                        }
                    ],
                    component.id)
            );
        });

        $scope.selectSchedule = function(selectedFullName) {
            $scope.curScheduleInfo.fullName = selectedFullName;

            console.log(selectedFullName + " selected");

            pullCourseComponents().then(function (response) {
                console.log(response);
                $scope.curScheduleInfo.components = response.data;
                $scope.eventSources[0].length = 0;

                $scope.curScheduleInfo.components.forEach(function (component) {
                    var daysArr = [];
                    component.days.forEach(function (day) {
                        if (day && day.toLowerCase) {
                            switch (day.toLowerCase()) {
                                case "monday":
                                    if (daysArr.indexOf(Day.MONDAY) == -1) daysArr.push(Day.MONDAY);
                                    break;
                                case "tuesday":
                                    if (daysArr.indexOf(Day.TUESDAY) == -1) daysArr.push(Day.TUESDAY);
                                    break;
                                case "wednesday":
                                    if (daysArr.indexOf(Day.WEDNESDAY) == -1) daysArr.push(Day.WEDNESDAY);
                                    break;
                                case "thursday":
                                    if (daysArr.indexOf(Day.THURSDAY) == -1) daysArr.push(Day.THURSDAY);
                                    break;
                                case "friday":
                                    if (daysArr.indexOf(Day.FRIDAY) == -1) daysArr.push(Day.FRIDAY);
                                    break;
                                case "saturday":
                                    if (daysArr.indexOf(Day.SATURDAY) == -1) daysArr.push(Day.SATURDAY);
                                    break;
                                case "sunday":
                                    if (daysArr.indexOf(Day.SUNDAY) == -1) daysArr.push(Day.SUNDAY);
                                    break;
                            }
                        }
                    });
                    $scope.eventSources[0] = $scope.eventSources[0].concat(
                        createArrOfEventsForCourseComponent(component.name.substring(
                                $scope.curScheduleInfo.fullName.length + 1),
                            [
                                {
                                    startTime: (component.startTime + 12) * 60,
                                    endTime: (component.endTime + 12) * 60,
                                    days: daysArr
                                }
                            ],
                            component.id)
                    );
                }, function (err) {
                    console.warn(err);
                });
            });
        }

        $scope.selectSchedule("Winter2018-First_Sched1");

        $scope.clearSelectedSchedule = function(){
            $scope.curScheduleInfo.scheduleSelected = false;

            $scope.curScheduleInfo.fullName = undefined;
            localStorage.removeItem("curScheduleFullName");

            $scope.curScheduleInfo.components = [];
            localStorage.removeItem("curScheduleComponents");

            refreshSchedules();
        };

        /**
         * function to check whether or not any variable is an integer or not
         * @param possibleInt variable to test
         * @returns {boolean} typeof possibleInt === integer
         */
        function isInt(possibleInt){
            var x;
            if(isNaN(possibleInt)){
                return false;
            }
            x = parseFloat(possibleInt);

            return (x | 0) === x;
        }

        /**
         *
         * @param title name of the class
         * @param segmentedEventArr array of segmented events
         * @param uniqueCourseComponentId integer id for the course component. MUST BE UNIQUE
         *
         * each segmented event will need to contain the:
         *      startTime time that the event starts (must be between 0 (midnight) and 1439 (11:59 PM)
         *      endTime time that the event ends
         *      days arr of days of the week that that segment is occurs
         *
         * note if a class is 9-11 Tues, Thursday and 5-6 Wednesday, there should be 2 segmented events
         *      one for the Tuesday-Thursday time slot and another for the Wednesday
         */
        function createArrOfEventsForCourseComponent(title, segmentedEventArr, uniqueCourseComponentId){
            if(!title || !segmentedEventArr || !segmentedEventArr.length || !uniqueCourseComponentId){
                console.warn("one of the variables you passed in is not valid, nothing is being created (yell at Ethan)");
                alert("error in courseComponent, nothing is being created");
                return undefined;
            }

            var courseComponentComponentArr = [];

            for(var i = 0; i < segmentedEventArr.length; i++){
                var segment = segmentedEventArr[i];

                //check to make sure that all the required fields are populated for the given segment
                if(!segment || !segment.startTime || !segment.endTime || !segment.days || segment.days.constructor !== Array){
                    console.warn("one of the segments is invalid, nothing is being created");
                    alert("error in segments, nothing created (yell at Ethan)");
                    return undefined;
                }

                //check to make sure that all of the days for the given segment are valid
                for(var j = 0; j < segment.days.length; j++){
                    var day = segment.days[j];
                    if(!isInt(day) || day < Day.SUNDAY || day > Day.SATURDAY) {
                        console.log(day)
                        console.warn("one of the days in the segment at index " + i + " is invalid, nothing is being created");
                        alert("error in segments, nothing created (yell at Ethan)");
                        return undefined;
                    }
                }

                //check to make sure that the start and end time for the given segment are valid
                if(segment.startTime < 0 || segment.endTime > 1439 || segment.startTime >= segment.endTime){
                    console.warn("in the segment at index " + i + " either the start or end time is invalid, nothing is being created");
                    alert("error in segments, nothing is being created");
                    return undefined;
                }
                if(segment.startTime + 30 > segment.endTime){
                    console.warn("valid segments must have an elapsed time of at least 30 minutes, nothing is being created");
                    alert("error in segments, nothing is being created");
                    return undefined;
                }

                var newCourseComponentComponent = new CourseComponentComponent(title, segment.startTime, segment.endTime, segment.days, uniqueCourseComponentId);

                courseComponentComponentArr.push(newCourseComponentComponent)
            }

            return courseComponentComponentArr;

        }

        /**
         *
         * @param title name of the class
         * @param startTime time that the class starts
         * @param endTime time that the class ends
         * @param days array of days that the course (AT THAT GIVEN TIME) is offered
         * @param id identification int for the given event
         * returns an event object that can be added to the calendar
         *
         * note, this can only create events at the same time, so adding a course component may require
         * adding multiple of these
         */
        function CourseComponentComponent(title, startTime, endTime, days, id){
            this.title = title;

            var startTimeHour = Math.floor(startTime / 60);
            var startTimeMinute = startTime % 60;

            var endTimeHour = Math.floor(endTime / 60);
            var endTimeMinute = endTime % 60;

            this.start = "" + startTimeHour + ":" + startTimeMinute;
            this.end = "" + endTimeHour + ":" + endTimeMinute;

            this.dow = days;
            this.id = id;

            this.allDay = false;
        }


        function pullCourseComponents(){
            if(!$scope.curScheduleInfo.fullName){
                console.warn("no schedule selected")
            }

            return $http.get("/schedule/" + $scope.curScheduleInfo.fullName + "/component");
        }

        function refreshSchedules(){
            console.info("refresh schedules called");

            $http.get("/schedule").then(function(res){
                if(res && res.data){
                    $scope.schedules = res.data;

                    console.log("Schedules refreshed");

                    //cache the schedules
                    localStorage.setItem("cachedSchedules",JSON.stringify($scope.schedules));
                }
                else {
                    console.warn("received incorrect response from localhost:8080/schedule");
                }
            }, function(err){
                console.warn(err);
            });
        }

        /* event source that contains custom events on the scope */
        // $scope.events = [];
        //
        // $scope.events = $scope.events.concat(createArrOfEventsForCourseComponent("CPE 309-01", [{startTime: 9 * 60 + 10, endTime: 10 * 60, days: [Day.MONDAY, Day.WEDNESDAY, Day.FRIDAY]}],1));
        // $scope.events = $scope.events.concat(createArrOfEventsForCourseComponent("CPE 309-02", [{startTime: 10 * 60 + 10, endTime: 11 * 60, days: [Day.MONDAY, Day.WEDNESDAY, Day.FRIDAY]}], 2));
        // $scope.events = $scope.events.concat(createArrOfEventsForCourseComponent("PHYS 132-01", [
        //     {startTime: 11 * 60 + 10, endTime: 12 * 60, days: [Day.MONDAY, Day.WEDNESDAY, Day.FRIDAY]},
        //     {startTime: 15 * 60 + 10, endTime: 18 * 60, days: [Day.WEDNESDAY]}
        // ],3));
        // $scope.events = $scope.events.concat(createArrOfEventsForCourseComponent("PHIL 231-06", [{startTime: 18 * 60 + 10, endTime: 20 * 60, days: [Day.MONDAY, Day.WEDNESDAY]}], 4));
        // $scope.events = $scope.events.concat(createArrOfEventsForCourseComponent("CPE 436-03", [{startTime: 13 * 60 + 40, endTime: 15 * 60, days: [Day.TUESDAY, Day.THURSDAY]}], 5));
        // $scope.events = $scope.events.concat(createArrOfEventsForCourseComponent("CPE 436-04", [{startTime: 15 * 60 + 10, endTime: 16 * 60 + 30, days: [Day.TUESDAY, Day.THURSDAY]}], 6));

        /* add and removes an event source of choice */
        $scope.addRemoveEventSource = function (sources, source) {
            var canAdd = 0;
            angular.forEach(sources, function (value, key) {
                if (sources[key] === source) {
                    sources.splice(key, 1);
                    canAdd = 1;
                }
            });
            if (canAdd === 0) {
                sources.push(source);
            }
        };

        /* remove event */
        $scope.remove = function (index) {
            $scope.eventSources[0].splice(index, 1);
        };

        $scope.calendarInstanceState = {
            currentView: "month",
            currentCalendar: "myCalendar1"
        };

        /* Change View */
        $scope.changeView = function (view, calendar) {
            $scope.calendarInstanceState.currentView = view;
            uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
        };
        /* Change View */
        $scope.renderCalendar = function (calendar) {
            $timeout(function () {
                if (uiCalendarConfig.calendars[calendar]) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('render');
                }
            });
        };
        /* Render Tooltip */
        $scope.eventRender = function (event, element, view) {
            element.attr({
                'tooltip': event.title,
                'tooltip-append-to-body': true
            });
            $compile(element)($scope);
        };
        /* config object */
        $scope.uiConfig = {
            calendar: {
                height: 500,
                editable: true,
                header: {
                    left: 'title',
                    center: '',
                    right: 'today prev,next'
                },
                eventClick: $scope.alertOnEventClick,
                eventDrop: $scope.alertOnDrop,
                eventResize: $scope.alertOnResize,
                eventRender: $scope.eventRender,
                minTime: "6:00:00",
                maxTime: "22:00:00"
            }
        };

        $scope.showModal = false;

        $scope.openAddCourseSectionModal = function () {

            ModalService.showModal({
                template: "addEvent.partial.html",
                controller: "ModalController"
            }).then(function(modal) {
                alert("second!")
                //it's a bootstrap element, use 'modal' to show it
                if(modal.element && modal.element.modal){
                    modal.element.modal();
                    console.log("modal was there")
                }
                else {

                    var intevalRef = $interval(function(){
                        if(modal.element.modal){
                            console.log("callling modal now");
                            modal.element.modal();
                            intevalRef.cancel();
                        }
                        else{
                            console.warn('modal still not ready');
                        }
                    }, 200);
                    console.warn("modal was not there")
                }

                modal.close.then(function(result) {
                    console.log(result);
                    var days = [];
                    if(result.days.sunday) days.push(Day.SUNDAY);
                    if(result.days.monday) days.push(Day.MONDAY);
                    if(result.days.tuesday) days.push(Day.TUESDAY);
                    if(result.days.wednesday) days.push(Day.WEDNESDAY);
                    if(result.days.thursday) days.push(Day.THURSDAY);
                    if(result.days.friday) days.push(Day.FRIDAY);
                    if(result.days.saturday) days.push(Day.SATURDAY);
                    var newCompArr = createArrOfEventsForCourseComponent(result.department + " " + result.courseNumber + "-" + result.courseSection, [{startTime: result.startTime, endTime: result.endTime, days: days}],10);
                    if(newCompArr) {
                        $scope.eventSources[0] = $scope.eventSources[0].concat(newCompArr);
                        console.log(newCompArr)
                    }
                    $scope.renderCalendar($scope.calendarInstanceState.currentCalendar)
                });
                //modal.element.modal();
            });

        };

        $scope.changeLang = function () {
            $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        };
        /* event sources array*/
        $scope.eventSources = [$scope.events];
        $scope.eventSources2 = [$scope.events];

    });


calendarDemoApp.directive("navigationBar", function () {
    return {
        restrict: "E",
        templateUrl: "../views/navbar.partial.html",
        scope: {},
        controller: ['$scope', 'ModalService', function navbarCtrl(scope, ModalService) {
            console.log(scope.$parent.calendarInstanceState);

            scope.showAModal = function() {
                ModalService.showModal({
                    templateUrl: "/addEvent",
                    controller: "ModalController"
                }).then(function(modal) {
                    console.log('test')
                    // The modal object has the element built, if this is a bootstrap modal
                    // you can call 'modal' to show it, if it's a custom modal just show or hide
                    // it as you need to.
                    modal.element.modal();
                    modal.close.then(function(result) {
                        $scope.message = result ? "You said Yes" : "You said No";
                    });
                });

            };

            scope.showRoomsModal = function(){
                ModalService.showModal({
                    templateUrl: "/addRoom",
                    controller: "AddRoomController"
                }).then(function(modal) {
                    console.log('test')
                    // The modal object has the element built, if this is a bootstrap modal
                    // you can call 'modal' to show it, if it's a custom modal just show or hide
                    // it as you need to.
                    modal.element.modal();
                    modal.close.then(function(result) {
                        $scope.message = result ? "You said Yes" : "You said No";
                    });
                });

            };

            scope.addUserModal = function() {
                ModalService.showModal({
                    templateUrl: "/addUser",
                    controller: "AddUserController"
                }).then(function(modal) {
                    console.log('test')
                    // The modal object has the element built, if this is a bootstrap modal
                    // you can call 'modal' to show it, if it's a custom modal just show or hide
                    // it as you need to.
                    modal.element.modal();
                    modal.close.then(function(result) {
                        $scope.message = result ? "You said Yes" : "You said No";
                    });
                });
            }

            scope.viewRoomsModal = function() {
                ModalService.showModal({
                    templateUrl: "/viewRooms",
                    controller: "ViewRoomsController"
                }).then(function(modal) {
                    console.log('test')
                    // The modal object has the element built, if this is a bootstrap modal
                    // you can call 'modal' to show it, if it's a custom modal just show or hide
                    // it as you need to.
                    modal.element.modal();
                    modal.close.then(function(result) {
                        $scope.message = result ? "You said Yes" : "You said No";
                    });
                });
            }

            scope.viewUsersModal = function() {
                ModalService.showModal({
                    templateUrl: "/viewUsers",
                    controller: "ViewUsersController"
                }).then(function(modal) {
                    console.log('test')
                    // The modal object has the element built, if this is a bootstrap modal
                    // you can call 'modal' to show it, if it's a custom modal just show or hide
                    // it as you need to.
                    modal.element.modal();
                    modal.close.then(function(result) {
                        $scope.message = result ? "You said Yes" : "You said No";
                    });
                });
            }
        }]
    }

});

calendarDemoApp.controller("ModalController", function($scope, close){
    console.log("modal loaded");

    $scope.newCourseComponent = {
        department: "",
        courseNumber: "",
        courseSection: "",
        startTime: "",
        endTime: "",
        days: {
            sunday: false,
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false
        }
    };

    $scope.courseComponentReady = function(){
        var bool1 = $scope.newCourseComponent.department.length != 0 && $scope.newCourseComponent.courseNumber &&
                $scope.newCourseComponent.courseSection && $scope.newCourseComponent.startTime && $scope.newCourseComponent.endTime;

        var days = $scope.newCourseComponent.days;
        var bool2 = days.sunday || days.monday || days.tuesday || days.wednesday || days.thursday || days.friday || days.saturday;

        return bool1 && bool2;
    };

    $scope.createNewComponent = function(){

        var obj = {

        };
        $http({
            method: 'POST',
            url: '/courseOffering/' + department,
            data: obj,
            headers : {'Content-Type': 'application/json',
                'Accept': '*/*' }
        }).then(function successCallback(response) {
            console.log(response);
            toastr.success(response.data.userName, "User successfully created!");
        }, function errorCallback(err) {
            toastr.error(err.msg, "Error creating user");
        });
    }

    $scope.closeModal = function(msg){
        console.log("modal is being closed");
        close(msg, 500);
    }

});

calendarDemoApp.controller("AddRoomController", function($scope, close, $http){
    console.log("modal loaded");

    $scope.newRoom = {
        name: "",
        resources: "",
        capacity: "",
        roomType: ""
    };

    $scope.newRoomReady = function(){
        return $scope.newRoom.name && $scope.newRoom.resources && ($scope.newRoom.capacity || $scope.newRoom.capacity === 0) && $scope.newRoom.roomType
    };

    $scope.createNewRoom = function(){
        var obj = {
            name : $scope.name,
            resources : [$scope.resources],
            capacity: $scope.capacity,
            roomType: $scope.roomType
        };
        $http({
            method: 'POST',
            url: '/room',
            data: obj,
            headers : {'Content-Type': 'application/json',
                'Accept': '*/*' }
        }).then(function successCallback(response) {
            console.log(response);
        }, function errorCallback(err) {
            console.log(err);
        });
    };

    $scope.closeModal = function(msg){
        console.log("modal is being closed");
        close(msg, 500);
    }

});

calendarDemoApp.controller("AddUserController", function($scope, close, $http, toastr){
    console.log("modal loaded");

    $scope.newUser = {
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        username: "",
        confirmPass: ""
    };

    $scope.newUserReady = function(){
        return $scope.newUser.email && $scope.newUser.firstName && $scope.newUser.lastName && $scope.newUser.password && $scope.newUser.username && ($scope.newUser.password == $scope.newUser.confirmPass)
    };

    $scope.addUser = function() {
        var obj = {
            email : $scope.newUser.email,
            firstName: $scope.newUser.firstName,
            fullName: $scope.newUser.firstName + $scope.lastName,
            lastName: $scope.newUser.lastName,
            password: $scope.newUser.password,
            userName: $scope.newUser.username
        };
        $http({
            method: 'POST',
            url: '/user',
            data: obj,
            headers : {'Content-Type': 'application/json',
                'Accept': '*/*' }
        }).then(function successCallback(response) {
            console.log(response);
            toastr.success(response.data.userName, "User successfully created!");
        }, function errorCallback(err) {
            toastr.error(err.msg, "Error creating user");
        });
    };

    $scope.closeModal = function(msg){
        console.log("modal is being closed");
        close(msg, 500);
    }

});

calendarDemoApp.controller("ViewRoomsController", function($scope, close, $http, toastr, NgTableParams){

    $scope.closeModal = function(msg){
        console.log("modal is being closed");
        close(msg, 500);
    };

    $scope.enableFiltering = true;

    $scope.refreshRooms = function() {

        $http({
            method: 'GET',
            url: '/room'
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.data = response.data;
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        var tp = new NgTableParams({}, {dataset: $scope.data});
    };


    $scope.refreshRooms();

    $scope.remove=function(roomID){
        $http({
            method: 'DELETE',
            url: '/room' + '?id=' + roomID,
            headers : {'Content-Type': 'application/json',
                'Accept': '*/*' }
        }).then(function successCallback(response) {
            $scope.message = response.data;
            $scope.refreshRooms();
        }, function errorCallback(response) {
            console.log(response);
        });
    }

});

calendarDemoApp.controller("ViewUsersController", function($scope, close, $http, toastr, NgTableParams){

    $scope.closeModal = function(msg){
        console.log("modal is being closed");
        close(msg, 500);
    };

    $scope.enableFiltering = true;

    $scope.refreshUsers = function() {

        $http({
            method: 'GET',
            url: '/user'
        }).then(function successCallback(response) {
            console.log(response.data);
            $scope.data = response.data;
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        var tp = new NgTableParams({}, {dataset: $scope.data});
    };

    $scope.refreshUsers();

    $scope.remove=function(userID){
        $http({
            method: 'DELETE',
            url: '/user' + '?id=' + userID,
            headers : {'Content-Type': 'application/json',
                'Accept': '*/*' }
        }).then(function successCallback(response) {
            $scope.message = response.data;
            $scope.refreshUsers();
        }, function errorCallback(response) {
            console.log(response);
        });
    }

});