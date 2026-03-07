package moodtracking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "habit_log", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"date", "habit_id"})
})
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String date;

    @Column(name = "habit_id", nullable = false)
    private Long habitId;

    @Column(nullable = false)
    private String status;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public Long getHabitId() { return habitId; }
    public void setHabitId(Long habitId) { this.habitId = habitId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
