package Models.Scheduling;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;

/**
 * Java representation of a schedule.
 *
 * @author Kris Campos
 * @version initial - 2/3/2017.
 */
@Entity
public class Schedule {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id;
    private String name;

    @Column(unique = true)
    private String fullName;

    @ManyToOne
    private Term term;

    @OneToMany(mappedBy = "sched", cascade = CascadeType.PERSIST)
    List<CourseOffering> courseList; // one entry per course in DB

    @OneToMany(mappedBy = "sched", cascade = CascadeType.PERSIST)
    List<RoomOffering> roomList; // one entry per course in DB

    @OneToMany(mappedBy = "sched", cascade = CascadeType.PERSIST)
    List<Comment> comments;

    protected Schedule() {
        courseList = new ArrayList<CourseOffering>();
        comments = new ArrayList<Comment>();
    }

    public Schedule(Term term, String name)
    {
        courseList = new ArrayList<CourseOffering>();
        comments = new ArrayList<Comment>();
        this.name = name;
        this.term = term;
        this.fullName = term.getTermName() + term.getTermYear() + "-" + name;
    }

    // getters and setters

    public Term getTerm() {
        return term;
    }

    public void setTerm(Term term) {
        this.term = term;
        this.fullName = term.getTermName() + term.getTermYear() + name;
    }

    public String getTermName() {
        return term.getTermName();
    }

    public int getTermYear() {
        return term.getTermYear();
    }

    public List<CourseOffering> getCourseList() {
        return courseList;
    }

    public boolean addCourse(CourseOffering course){
        return courseList.add(course);
    }

    public boolean removeCourse(CourseOffering course){
        return courseList.remove(course);
    }

    public void addRoom(RoomOffering room) {
        roomList.add(room);
    }

    public void removeRoom(RoomOffering room) {
        roomList.remove(room);
    }

    public List<Comment> getComments() {
        return comments;
    }

    public boolean addComment(Comment comment) {
        return comments.add(comment);
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String getFullName() {
        return fullName;
    }

    public String getId() {
        return id;
    }
}
