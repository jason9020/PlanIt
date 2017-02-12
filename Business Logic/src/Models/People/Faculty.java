package Models.People;
import Models.Chunks.Chunk;
import Models.Chunks.FacultyChunk;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class Faculty extends User {
    private static final int DAYS_IN_WEEK = 7;
    private static final int INTERVALS_PER_DAY = 48; //30 min intervals

    /* each second-index indicates a 30 minute interval.
    * if there is a 1 in days[3][14] that means this professor would prefer to teach wednesday from 7:00 AM - 7:30 AM
    * 0 - [12:00 AM, 12:30 AM]
    * 1 - [12:30 AM, 1:00 AM]
    * 2 - [1:00 AM, 1:30 AM]
    * 3 - [1:30 AM, 2:00 AM]
    * 4 - [2:00 AM, 2:30 AM]
    * ...
    * 46 - [11:00 PM, 11:30 PM]
    * 47 - [11:30 PM, 12:00 AM]*/
    private int[][] preferredTimes;
    private int preferredTotalHours;// workload preference
    private Map<Integer, Integer> coursePreferences = new HashMap<>();// course preferences -1, 0, 1 <=> CANNOT, CAN, PREFER

    public Faculty(int userID, String userName, String email, String firstName, String lastName) {
        super(userID, userName, email, firstName, lastName);
        preferredTimes = new int[DAYS_IN_WEEK][INTERVALS_PER_DAY];
        for(int i = 0; i<DAYS_IN_WEEK; i++){
            for(int j = 0; j<INTERVALS_PER_DAY; j++) {

                preferredTimes[i][j] = 0; //New rooms start out entirely unoccupied
            }
        }
    }

    public boolean addCoursePref(int courseNum, int prefLvl) {
        if (prefLvl >= -1 && prefLvl <= 1) {
            coursePreferences.put(courseNum, prefLvl);
            return true;
        }
        return false;
    }

    public boolean addTimePref(int day, int interval, int prefLvl){
        if (prefLvl >= -1 && prefLvl <= 1
                && day >= 0 && day < DAYS_IN_WEEK
                && interval >= 0 && interval <= INTERVALS_PER_DAY) {
            preferredTimes[day][interval] = prefLvl;
            return true;
        }
        return false;
    }

    public boolean setWeeklyHoursPref(int total) {
        if (0 < total && total <= 168) {
            preferredTotalHours = total;
            return true;
        }
        return false;
    }

    public ArrayList<Chunk> preferencesToChunks(){
        int chunki = 0;
        int currentChunkVal;
        ArrayList<Chunk> chunks = new ArrayList<Chunk>();
        for(int dayi = 0; dayi < DAYS_IN_WEEK; dayi++){
            currentChunkVal = preferredTimes[dayi][0];
            if(currentChunkVal != 0){
                chunks[chunki] = new FacultyChunk(getUserID(), dayi, 0, currentChunkVal);
            }
            for(int houri = 1; houri < INTERVALS_PER_DAY; houri++){
                if(preferredTimes[dayi][houri] = -1*currentChunkVal){
                    //end last chunk, start new chunk
                }
                else if (preferredTimes[dayi][houri] == 0 && currentChunkVal != 0){
                    //end current chunk
                }
                else{
                    //move along
                }
            }
        }
    }
}