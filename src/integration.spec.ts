import * as client from './client/client';
import Express from 'express';
import * as http from 'http';
import transcriptServer from './server/transcriptServer';
import { AddressInfo } from 'net';
import { setBaseURL } from './client/remoteService';
import * as db from './server/transcriptManager';

/**
 * Tests for the Transcript Manager. This test suite automatically deploys a local testing server
 * and cleans it up when it's done. Each test is hermetic, as the datastore is cleared before each
 * test runs.
 */
describe('TranscriptManager', () => {
  // The server instance, once deployed for testing purposes
  let server: http.Server;

  // Set up the server once before all tests run
  beforeAll(async () => {
    // Deploy a testing server
    const app = Express();
    server = http.createServer(app);

    // Add the transcript server's routes to the express server
    transcriptServer(app);

    db.initialize();

    // Start the server on a random, free port, then fetch that address and configure the client to use that server.
    await server.listen();
    const address = server.address() as AddressInfo;
    setBaseURL(`http://localhost:${address.port}`);
  });

  // Tear down the server once all tests are done
  afterAll(async () => {
    // After all tests are done, shut down the server to avoid any resource leaks
    await server.close();
  });

  // Clear the datastore before each test to ensure hermetic tests
  beforeEach(() => {
    // Before any test runs, clean up the datastore. This should ensure that tests are hermetic.
    db.initialize();
  });

  // Unit tests - create a student
  describe('Unit tests: creating students', () => {
    it('should return an ID', async () => {
      const createdStudent = await client.addStudent('Aziza');
      expect(createdStudent.studentID).toBeGreaterThan(4);
    });

    // todo - implement more tests here
    it('should return different IDs for different students', async () => {
      // todo - complete implementation
    });
  });

  // Unit tests - post a grade
  describe('Unit tests: posting grades', () => {
    it('should not accept grades for invalid student IDs', async () => {
      await expect(client.addGrade(9999, 'CS360', 95)).rejects.toThrow();
    });

    // todo - implement more tests here
    it('should accept grades for students ', async () => {
      // todo - complete implementation
    });
  });

  // Full system tests
  describe('Full-system tests', () => {
    it('should allow multiple students to have the same name, giving them different IDs', async () => {
      // Create 2 new Aziza entries
      const [createdAziza1, createdAziza2] = await Promise.all([
        client.addStudent('Aziza'),
        client.addStudent('Aziza'),
      ]);
      expect(createdAziza2.studentID).not.toBe(createdAziza1.studentID);
      // Fetch all Aziza entries
      const ids = await client.getStudentIDs('Aziza');
      // Make sure the 2 created ones are both listed
      expect(ids).toContain(createdAziza1.studentID);
      expect(ids).toContain(createdAziza2.studentID);
    });
    it('should remove a deleted student from the list of students', async () => {});
  });
});
