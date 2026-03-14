"""add embedding column

Revision ID: 8c5cbedd43f7
Revises: e24591de4e6c
Create Date: 2026-03-14 15:28:53.940840

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector



# revision identifiers, used by Alembic.
revision: str = '8c5cbedd43f7'
down_revision: Union[str, Sequence[str], None] = 'e24591de4e6c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "frame_embeddings",
        sa.Column("embedding", Vector(512), nullable=False),
    )

    op.add_column(
        "frame_embeddings",
        sa.Column(
            "created_at",
            sa.TIMESTAMP(),
            server_default=sa.func.now(),
        ),
    )



def downgrade():
    op.drop_column("frame_embeddings", "embedding")
    op.drop_column("frame_embeddings", "created_at")
