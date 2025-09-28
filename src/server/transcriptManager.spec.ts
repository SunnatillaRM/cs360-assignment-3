import * as tm from "./transcriptManager";

describe("TranscriptManager", () => {
  beforeEach(() => {
    tm.initialize();
  });

  test("init makes 4 students", () => {
    expect(tm.getAll().length).toBe(4);
  });

  test("Sardor has CS360=100 and CS411=100", () => {
    const ids = tm.getStudentIDs("Sardor");
    expect(ids.length).toBe(1);
    const t = tm.getTranscript(ids[0]);
    expect(t?.grades).toEqual(
      expect.arrayContaining([
        { course: "CS360", grade: 100 },
        { course: "CS411", grade: 100 }
      ])
    );
  });

  test("Nigora has CS360=100", () => {
    const ids = tm.getStudentIDs("Nigora");
    expect(ids.length).toBe(1);
    const t = tm.getTranscript(ids[0]);
    expect(t?.grades).toEqual([{ course: "CS360", grade: 100 }]);
  });

  test("Jasur appears twice", () => {
    const ids = tm.getStudentIDs("Jasur");
    expect(ids.length).toBe(2);
    expect(tm.getTranscript(ids[0])).toBeDefined();
    expect(tm.getTranscript(ids[1])).toBeDefined();
  });

  test("addStudent works", () => {
    const id = tm.addStudent("Sam1");
    const t = tm.getTranscript(id);
    expect(t?.student.studentName).toBe("Sam1");
  });

  test("deleteStudent works", () => {
    const id = tm.addStudent("Sam2");
    tm.deleteStudent(id);
    expect(tm.getTranscript(id)).toBeUndefined();
    expect(() => tm.deleteStudent(id)).toThrow();
  });

  test("addGrade works", () => {
    const id = tm.addStudent("Sam3");
    tm.addGrade(id, "InterestingCourse1", 70);
    expect(tm.getGrade(id, "InterestingCourse1")).toBe(70);
  });

  test("getGrade throws for missing course", () => {
    const ids = tm.getStudentIDs("Sardor");
    const id = ids[0];
    expect(() => tm.getGrade(id, "NotACourse")).toThrow();
  });

  test("addStudent fails on empty name", () => {
    expect(() => tm.addStudent("")).toThrow();
  });

  test("addStudent fails on null name", () => {
    expect(() => tm.addStudent(null as any)).toThrow();
  });
});
