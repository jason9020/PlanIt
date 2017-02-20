import Models.People.Faculty;
import Models.Scheduling.*;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.RollbackException;

/**
 * Created by Justin on 2/13/2017.
 */
public class ScheduleTest {

    private static EntityManagerFactory entityManagerFactory;

    @BeforeClass
    public static void setUpEntityManagerFactory() {
        entityManagerFactory = Persistence.createEntityManagerFactory( "schedPU" );
    }

    @AfterClass
    public static void closeEntityManagerFactory() {
        entityManagerFactory.close();
    }

    @Test
    public void canPersistAndLoadTermAndSchedule() {
        EntityManager entityManager = entityManagerFactory.createEntityManager();

        Faculty faculty = new Faculty("xXJoe_15Xx", "doesnot@exist", "John", "Doe");
        Term term = new Term("Fall", 2018);

        Schedule one =  new Schedule(term, "First_Sched1");
        RoomOffering room = new RoomOffering(one, "Theatre");
        one.setTerm(term);
        CourseOffering offering = new CourseOffering("CPE453", one);
        offering.addComponent(new Component("Lecture",1, 2, 3, offering, room, faculty, 01));
        one.addCourse(offering);
        one.addCourse(new CourseOffering("CPE349", one));
        one.addCourse(new CourseOffering("CPE309", one));

        Schedule two = new Schedule(term, "Second_Sched2");
        two.setTerm(term);
        two.addCourse(new CourseOffering("CPE453", two));
        two.addCourse(new CourseOffering("CPE349", two));
        two.addCourse(new CourseOffering("CPE309", two));

        term.addSched(one);
        term.addSched(two);

        try {
            entityManager.getTransaction().begin();

            entityManager.persist(faculty);
            entityManager.persist(room);
            entityManager.persist(term);

            entityManager.getTransaction().commit();

            // get a new EM to make sure data is actually retrieved from the store and not Hibernate's internal cache
            entityManager.close();
        }
        catch (RollbackException e) {
            System.out.println("********************************************");
            System.out.printf("Term %s-%d already persists in datastore.\n", term.getTermName(), term.getTermYear());
            System.out.println("********************************************");
            entityManager.close();
            System.exit(0);
        }
        entityManager = entityManagerFactory.createEntityManager();

        // load it back
        entityManager.getTransaction().begin();

        Schedule loadedTerm = entityManager.find( Schedule.class, one.getId() );
        assertEquals(loadedTerm.getName(), one.getName());

        entityManager.getTransaction().commit();
        System.out.println("********************************************");
        System.out.printf("Successfully added %s-%d to datastore.\n", term.getTermName(), term.getTermYear());
        System.out.println("********************************************");

        entityManager.close();
    }
}
