import supertest from "supertest";
import server from "../src/app";
import httpStatus from "http-status";
import { createConsole } from "./factories/console.factory";
import { createGame } from "./factories/game-factory";
import { faker } from "@faker-js/faker";
import { cleanDb, consoleDb } from "./helpers";
import prisma from "config/database";

const api = supertest(server);

beforeAll(async ()=>{
    await cleanDb();
})

beforeEach(async()=>{
    await cleanDb();
})

afterAll(()=>{
    prisma.$disconnect();
})

describe('testando a API', () => {
    it("should return with status 200 , and a empty array when does not have games registereds", async ()=>{
        const response = await api.get("/games");
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(expect.arrayContaining([]));
    })

    it("should respond with status 200, and a array when have games registereds", async () => {

        let cons = await createConsole();
        await createGame(cons.id);

        const response = await api.get("/games");

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                title: expect.any(String),
                consoleId: expect.any(Number)
            })
        ]));
    });

    it("should return with status 200 , and a object of the founded game", async ()=>{
        let cons = await createConsole();
        console.log(await consoleDb(),"console")
        let game = await createGame(cons.id);

        const response = await api.get("/games/"+game.id);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            consoleId: expect.any(Number)
        }));
    })

    it("should respond with status 404, when does not found the specified game", async () => {
        const response = await api.get("/games/1");
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should return with status 401 , when try insert a game with the same title", async ()=>{
        let cons = await createConsole();
        let game = await createGame(cons.id);
    
        const response = await api.post("/games/").send({
            title:game.title,
            consoleId: game.consoleId
        });

        expect(response.status).toBe(httpStatus.CONFLICT);
    })

    it("should return with status 401 , when try insert a game with a consoleId not inserted", async () => {
        const response = await api.post("/games/").send({
            title: faker.lorem.words(2),
            consoleId: 1
        });

        expect(response.status).toBe(httpStatus.CONFLICT);
    });
})