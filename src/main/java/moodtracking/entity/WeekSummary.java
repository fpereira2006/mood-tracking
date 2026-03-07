package moodtracking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "week_summary")
public class WeekSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String weekStart;

    @Column(columnDefinition = "TEXT")
    private String note;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getWeekStart() { return weekStart; }
    public void setWeekStart(String weekStart) { this.weekStart = weekStart; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
