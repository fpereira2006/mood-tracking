package moodtracking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "habit")
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "created_at")
    private String createdAt;

    @Column(name = "position")
    private Integer position;

    @Column(name = "priority")
    private Integer priority;

    @Column(name = "icon")
    private String icon;

    @Column(name = "active")
    private Boolean active;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
