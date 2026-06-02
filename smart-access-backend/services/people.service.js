// In-memory people store (for student/faculty profiles - no SQL Server table mapping yet)
// Can be moved to rejected_persons or a new table if needed

let people = [
  {
    _id: 'p1',
    name: 'John Doe',
    type: 'student',
    studentId: 'STU001',
    photo: null,
    places: ['North Gate', 'Library']
  },
  {
    _id: 'p2',
    name: 'Prof. Alice Johnson',
    type: 'professor',
    photo: null,
    places: ['Admin Building']
  },
  {
    _id: 'p3',
    name: 'Samantha Lee',
    type: 'assistant',
    photo: null,
    places: ['Main Office']
  },
  {
    _id: 'p4',
    name: 'Dean Richard Miles',
    type: 'vip',
    photo: null,
    places: ['Admin Building', 'Conference Hall']
  }
];

function getPeople() {
  return people;
}

function createPerson({ name, type, studentId, photo, places }) {
  const id = String(Date.now());
  const p = { _id: id, name, type, studentId: studentId || null, photo: photo || null, places: places || [] };
  people.unshift(p);
  return p;
}

function deletePerson(id) {
  const idx = people.findIndex(p => p._id === id);
  if (idx === -1) return null;
  const [removed] = people.splice(idx, 1);
  return removed;
}

function updatePerson(id, updates) {
  const person = people.find(p => p._id === id);
  if (!person) return null;
  Object.assign(person, updates);
  return person;
}

module.exports = { getPeople, createPerson, deletePerson, updatePerson };
