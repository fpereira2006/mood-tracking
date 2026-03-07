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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
}
