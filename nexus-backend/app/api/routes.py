from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List
import uuid

from app.db.database import get_session
from app.models.schemas import Task, TaskRead, Subtask

router = APIRouter()

@router.get("/tasks", response_model=List[TaskRead])
def get_tasks(session: Session = Depends(get_session)):
    statement = select(Task).options(selectinload(Task.subtasks))
    return session.exec(statement).all()

@router.post("/tasks", response_model=TaskRead)
def create_task(task_data: dict, session: Session = Depends(get_session)):
    subtasks_data = task_data.pop("subtasks", [])
    
    if "id" in task_data:
        try:
            task_data["id"] = uuid.UUID(str(task_data["id"]))
        except ValueError:
            task_data["id"] = uuid.uuid4()
            
    db_task = Task(**task_data)
    session.add(db_task)
    session.commit()
    
    for st in subtasks_data:
        subtask_obj = Subtask(
            id=uuid.UUID(str(st["id"])) if "id" in st and len(str(st["id"])) == 36 else uuid.uuid4(),
            title=st["title"],
            completed=st.get("completed", False),
            task_id=db_task.id
        )
        session.add(subtask_obj)
        
    session.commit()
    session.refresh(db_task)
    return db_task

@router.patch("/tasks/{task_id}", response_model=TaskRead)
def update_task(task_id: uuid.UUID, updates: dict, session: Session = Depends(get_session)):
    statement = select(Task).where(Task.id == task_id).options(selectinload(Task.subtasks))
    db_task = session.exec(statement).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    subtasks_data = updates.pop("subtasks", None)

    for key, value in updates.items():
        if hasattr(db_task, key):
            setattr(db_task, key, value)

    if subtasks_data is not None:
        for existing_st in db_task.subtasks:
            session.delete(existing_st)
        for st in subtasks_data:
            new_st = Subtask(
                id=uuid.UUID(str(st["id"])) if "id" in st and len(str(st["id"])) == 36 else uuid.uuid4(),
                title=st["title"],
                completed=st.get("completed", False),
                task_id=db_task.id
            )
            session.add(new_st)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: uuid.UUID, session: Session = Depends(get_session)):
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(db_task)
    session.commit()
    return {"ok": True}
