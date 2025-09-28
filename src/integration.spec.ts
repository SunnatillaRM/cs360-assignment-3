import * as client from "./client/client";
import Express from "express";
import * as http from "http";
import transcriptServer from "./server/transcriptServer";
import { AddressInfo } from "net";
import { setBaseURL } from "./client/remoteService";
import * as db from "./server/transcriptManager";

describe("TranscriptManager integration", () => {
  let server: http.Server;

  beforeAll(async () => {
    const app = Express();
    server = http.createServer(app);
    transcriptServer(app);

    db.initialize();

    await server.listen();
    const address = server.address() as AddressInfo;
    setBaseURL(`http://localhost:${address.port}`);
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    db.initialize();
  });

  // POST /transcripts
  test("POST /transcripts returns 201 and an ID", async () => {
    const student = await client.addStudent("Aziza");
    expect(student.studentID).toBeGreaterThan(0);

    const ids = await client.getStudentIDs("Aziza");
    expect(ids).toContain(student.studentID);
  });

  test("POST /transcripts returns 400 for missing name", async () => {
    await expect(client.addStudent("")).rejects.toThrow();
  });

  // GET /transcripts/:id
  test("GET /transcripts/:id returns 200 for valid ID", async () => {
    const s = await client.addStudent("Sam1");
    const t = await client.getTranscript(s.studentID);
    expect(t.student.studentName).toBe("Sam1");
  });

  test("GET /transcripts/:id returns 404 for missing ID", async () => {
    await expect(client.getTranscript(99999)).rejects.toThrow();
  });

  // GET /studentids?name=...
  test("GET /studentids returns all IDs for same name", async () => {
    const s1 = await client.addStudent("Sam2");
    const s2 = await client.addStudent("Sam2");
    const ids = await client.getStudentIDs("Sam2");
    expect(ids).toEqual(expect.arrayContaining([s1.studentID, s2.studentID]));
  });

  // DELETE /transcripts/:id
  test("DELETE /transcripts/:id returns 204 and deletes", async () => {
    const s = await client.addStudent("Sam3");
    await client.deleteStudent(s.studentID);
    const ids = await client.getStudentIDs("Sam3");
    expect(ids).not.toContain(s.studentID);
    await expect(client.getTranscript(s.studentID)).rejects.toThrow();
  });

  // POST /transcripts/:studentID/:course
  test("POST /transcripts/:id/:course returns 201 for valid grade", async () => {
    const s = await client.addStudent("Sam4");
    await client.addGrade(s.studentID, "InterestingCourse1", 70);
    const g = await client.getGrade(s.studentID, "InterestingCourse1");
    expect(g).toEqual({
      studentID: s.studentID,
      course: "InterestingCourse1",
      grade: 70,
    });
  });

  test("duplicate grade returns 400", async () => {
    const s = await client.addStudent("Sam5");
    await client.addGrade(s.studentID, "InterestingCourse1", 75);
    await expect(
      client.addGrade(s.studentID, "InterestingCourse1", 80)
    ).rejects.toThrow();
  });

  test("invalid grade returns 400", async () => {
    const s = await client.addStudent("Sam6");
    // @ts-expect-error sending invalid grade on purpose
    await expect(client.addGrade(s.studentID, "InterestingCourse1", "")).rejects.toThrow();
  });
});
