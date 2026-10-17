"""create journal entries table

Revision ID: 5b1e2c7d8f90
Revises: 249fa41691a1
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5b1e2c7d8f90"
down_revision: Union[str, Sequence[str], None] = "249fa41691a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "journal_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_journal_entries_id"),
        "journal_entries",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_journal_entries_user_id"),
        "journal_entries",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_journal_entries_user_id"), table_name="journal_entries")
    op.drop_index(op.f("ix_journal_entries_id"), table_name="journal_entries")
    op.drop_table("journal_entries")
