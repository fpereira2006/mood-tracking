package moodtracking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sleep_log")
public class SleepLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String date;

    private String bedtime;
    private String wakeTime;
    private String quality;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getBedtime() { return bedtime; }
    public void setBedtime(String bedtime) { this.bedtime = bedtime; }

    public String getWakeTime() { return wakeTime; }
    public void setWakeTime(String wakeTime) { this.wakeTime = wakeTime; }

    public String getQuality() { return quality; }
    public void setQuality(String quality) { this.quality = quality; }
}
