const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;
    const Database = await sqliteConnection();

    const checkUserExists = await Database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso")
    }

    const hashedPassword = await hash(password, 8);

    await Database.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]);

    return response.status(201).json("só demorei 40 pra fazer essa merda funciona, 40 min pra porra do email ta escrito emeil......")

  }

  async update(request, response) {
    const { name, email, password, oldPassword } = request.body;
    const { id } = request.params;
    const Database = await sqliteConnection();
    const user = await Database.get("SELECT * FROM users WHERE id = ?", [id]);

    if (!user) {
      throw new AppError("Usuário não encontrado")
    }

    const userWithUpdatedEmail = await Database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este email já está em uso.");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !oldPassword) {
      throw new AppError('Você precisa informar a senha antiga para definir a nova senha')
    }

    if (password && oldPassword) {
      const checkOldPassword = await compare(oldPassword, user.password)
      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere")
      }

      user.password = await hash(password, 8);
    }

    await Database.run(`
    UPDATE users SET
    name = ?,
    email = ?,
    password = ?,
    updated_at = DATETIME('now')
    WHERE id = ? `,
      [user.name, user.email, user.password, id]);
    return response.status(200).json();
  }
}
module.exports = UsersController;