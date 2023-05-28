const knex = require("../database/knex");

class MoviesController {
    async create(request, response) {
        const { title, description, tags, rating } = request.body;
        const { user_id } = request.params;
        let newRating = rating
        if (newRating > 5) {
            newRating = 5
        }
        const [movie_id] = await knex("movies").insert({
            title,
            description,
            "rating": newRating != null ? newRating : 0,
            user_id
        });
        const tagsinsert = tags.map(name => {
            return {
                movie_id,
                name,
                user_id
            }
        });
        await knex("tags").insert(tagsinsert);

        response.json();
    };

    async show(request, response) {
        const { id } = request.params;

        const movie = await knex("movies").where({ id }).first();
        const tags = await knex("tags").where({ movie_id: id }).orderBy("name");

        return response.json({
            ...movie,
            tags
        });
    };

    async delete(request, response) {
        const { id } = request.params;

        await knex("movies").where({ id }).delete();

        return response.json()
    }

    async index(request, response) {
        const { title, tags } = request.query;
        const { user_id } = request.query;

        let movies;

        if (tags) {
            const filterTags = tags.split(",").map(tag => tag.trim());

            movies = await knex("tags")
                .select([
                    "movies.id",
                    "movies.title",
                    "movies.user_id",
                ])
                .where("movies.user_id", user_id)
                .whereLike("movies.title", `%${title}%`)
                .whereIn("name", filterTags)
                .innerJoin("movies", "movies.id", "tags.movie_id")
                .orderBy("movies.title");
        } else {
            movies = await knex("movies")
                .where({ user_id })
                .whereLike("title", `%${title}%`)
                .orderBy("title");
        }

        const userTags = await knex("tags").where({ user_id });
        let moviesReturn = []
        movies.map(movie => {
            const movieTags = userTags.filter(tag => tag.movie_id === movie.id);
            movie.tags = movieTags
            moviesReturn.push(movie)
        });

        return response.json(moviesReturn);
    }
}
module.exports = MoviesController;