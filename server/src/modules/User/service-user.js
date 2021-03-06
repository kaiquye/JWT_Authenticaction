import Repositories from "./repositories-user.js";
import yup from './yup.js';
import bcrypt from 'bcrypt';
import Auth from '../../middleware/Auth.js'

class Services {
    async Create({ name, email, password }) {
        console.log(name, email, password)
        const valideteForm = await yup.Validate(name, password, email);
        if (valideteForm) return new Error(valideteForm);
        try {
            const AlreadyHasUser = await Repositories.findByEmail(email);
            if (AlreadyHasUser) return new Error('Já exite um usuario cadastrado com esse email');
            const salt = bcrypt.genSaltSync(10);
            const crypt = bcrypt.hashSync(password, salt);
            await Repositories.Create(name, email, crypt);
        } catch (error) {
            console.log(error)
            throw new Error('Não foi possivel criar usuario');
        }
    }

    async LoginUser({ email, password }) {
        try {
            const userPassword = await Repositories.getPasswordByEmail(email);
            if (!userPassword) return new Error('email não existe.');
            const match = await bcrypt.compare(password, userPassword.password);
            if (!match) return new Error('senha invalida');
            // crio o token e refrehstoken
            const idUser = userPassword.id;
            const { Token, RefreshToken } = Auth.CreateToken({ email, idUser });
            console.log('token', Token, 'refrehs', RefreshToken)
            // salvo o refreshToken do usuario no DB junto com seu ID.
            await Repositories.createNewRefreshToken(RefreshToken, idUser);
            // retorno o token de acesso
            return { Token, RefreshToken: idUser, name: userPassword.name, email: email }
        } catch (error) {
            console.log(error)
            throw new Error('Não foi possivel fazer o login do  usuario');
        }
    }

    async RefreshToken(id) {
        try {
            // --> busca um token no banco de dados;
            // esse token é criado quando o usuario faz login. Ele tem um tempo de validade maior
            const { accept_token } = await Repositories.findRefreshTokenByUserId(id);
            console.log('token', accept_token)
            // verificar se esse token exite, evita usuarios bloqueados usar a apliacação;
            if (!accept_token) return new Error('Refresh token não informado.');
            // Valida o refreshToken que esta salvo no banco de dados. (time);
            const { Token, data } = await Auth.ValidateRefreshToken(accept_token);
            return { Token, data }
        } catch (error) {
            console.log(error)
            throw new Error('Não foi possivel gerar um novo token');
        }
    }

}
export default new Services();
