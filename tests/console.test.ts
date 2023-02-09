import supertest from "supertest";
import server from "../src/app";
import httpStatus from "http-status";
import { createConsole } from "./factories/console.factory";
import { createGame } from "./factories/game-factory";
import { faker } from "@faker-js/faker";
import { cleanDb } from "./helpers";
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
    it("should return with status 200 , and a empty array when does not have consoles registereds", async ()=>{
        const response = await api.get("/consoles");
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(expect.arrayContaining([]));
    })

    it("should respond with status 200, and a array when have consoles registereds", async () => {
        await createConsole();

        const response = await api.get("/consoles");

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
            })
        ]));
    });

    it("should return with status 200 , and a object of the founded console", async ()=>{
        let cons = await createConsole();

        const response = await api.get("/consoles/"+cons.id);

        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String)
        }));
    })

    it("should respond with status 404, when does not found the specified console", async () => {
        const response = await api.get("/consoles/1");
    
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should return with status 401 , when try insert a game with the same title", async ()=>{
        let cons = await createConsole();
    
        const response = await api.post("/consoles/").send({
            name: cons.name
        });

        expect(response.status).toBe(httpStatus.CONFLICT);
    })

    it("should return with status 422 , when try insert a console without a name", async ()=>{
        let cons = await createConsole();
    
        const response = await api.post("/consoles/").send({});

        expect(response.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
    })
})