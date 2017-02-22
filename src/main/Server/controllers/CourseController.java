package Server.controllers;

import Models.Scheduling.Course;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Controller for all course objects
 *
 * @author Kris
 * @version 0.2 - Updated to reflect API Doc v 0.2 - 2/21/2017
 * @version init - 2/13/2017.
 */
@RestController
@RequestMapping("/course")
public class CourseController {

    @RequestMapping(method = RequestMethod.GET)
    public List<Course> getCourse(@RequestParam String query) {
        return new ArrayList<>();
    }

    @RequestMapping(method = RequestMethod.PUT)
    public Course putCourse(@RequestParam Course course) {
        return course;
    }

    @RequestMapping(value = "/{name}", method = RequestMethod.GET)
    public Course getCourseName(@PathVariable String name) {
        return new Course(name);
    }

    @RequestMapping(value = "/{name}", method = RequestMethod.POST)
    public void postCourseName(@PathVariable String name) {

    }

    @RequestMapping(value = "/{name}", method = RequestMethod.DELETE)
    public void deleteCourseName(@PathVariable String name) {

    }
}
