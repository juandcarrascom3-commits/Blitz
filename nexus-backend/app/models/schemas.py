import enum
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlmodel import Field, Relationship, SQLModel

class StatusEnum(str, enum.Enum):
    todo = "todo"
    in_progress = "in-progress"
    review = "review"
    done = "done"

class PriorityEnum(str, enum.Enum):
    critical = "critical"
    medium = "medium"
    low = "low"

class SubtaskBase(SQLModel):
    title: str
    completed: bool = Field(default=False)

class Subtask(SubtaskBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    task_id: uuid.UUID = Field(foreign_key="task.id", ondelete="CASCADE")
    task: Optional["Task"] = Relationship(back_populates="subtasks")

class TaskBase(SQLModel):
    title: str
    description: Optional[str] = Field(default=None)
    status: StatusEnum = Field(default=StatusEnum.todo)
    priority: PriorityEnum = Field(default=PriorityEnum.low)
    deadline: Optional[str] = Field(default=None)
    hasNotes: bool = Field(default=False)
    notes: Optional[str] = Field(default="")

class Task(TaskBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    subtasks: List[Subtask] = Relationship(back_populates="task", cascade_delete=True)

class TaskRead(TaskBase):
    id: uuid.UUID
    subtasks: List[SubtaskBase] = []
