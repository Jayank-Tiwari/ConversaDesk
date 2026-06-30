from fastapi import APIRouter

from app.services.rag_service import (
    build_rag,
    search_rag
)

router = APIRouter()


@router.get("/build-rag")
def build_database():

    build_rag()

    return {
        "message": "RAG database created"
    }


@router.get("/search-rag")
def search(query: str):

    results = search_rag(query)

    return {

        "results": [

            r.page_content

            for r in results
        ]
    }