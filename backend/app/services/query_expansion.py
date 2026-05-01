from sentence_transformers import SentenceTransformer, util


class QueryExpansionService:

    def __init__(self):

        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # small phrase bank to compare against
        self.phrase_bank = [
            "a person on the beach",
            "people walking on the beach",
            "cars driving on a road",
            "city traffic at night",
            "animals in nature",
            "a dog running",
            "a cat sitting",
            "people walking",
            "forest with trees",
            "ocean waves",
            "sunset landscape",
            "people in city street",
            "vehicles on highway",
        ]

        self.bank_embeddings = self.model.encode(
            self.phrase_bank,
            convert_to_tensor=True
        )

    def expand(self, query: str, top_k: int = 3):

        query_emb = self.model.encode(query, convert_to_tensor=True)

        scores = util.cos_sim(query_emb, self.bank_embeddings)[0]

        top = scores.topk(top_k)

        expansions = [self.phrase_bank[i] for i in top.indices]

        # include original query
        expansions.insert(0, f"a photo of {query}")

        return expansions