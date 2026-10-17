"""create habits table

Revision ID: 6c2d3e8f901a
Revises: 5b1e2c7d8f90
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6c2d3e8f901a"
down_revision: Union[str, Sequence[str], None] = "5b1e2c7d8f90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "habits",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("detail", sa.String(length=255), nullable=True),
        sa.Column("done", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_habits_id"), "habits", ["id"], unique=False)
    op.create_index(op.f("ix_habits_user_id"), "habits", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_habits_user_id"), table_name="habits")
    op.drop_index(op.f("ix_habits_id"), table_name="habits")
    op.drop_table("habits")
