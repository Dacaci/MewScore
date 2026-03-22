import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface ProgrammeProgress {
  startedAt: Timestamp;
  checkedTasks: string[];
}

export async function getProgrammeProgress(
  userId: string,
  programmeId: string
): Promise<ProgrammeProgress | null> {
  try {
    const ref = doc(db, 'users', userId, 'programmeProgress', programmeId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as ProgrammeProgress;
  } catch {
    return null;
  }
}

export async function startProgramme(
  userId: string,
  programmeId: string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'programmeProgress', programmeId);
  await setDoc(ref, {
    startedAt: Timestamp.now(),
    checkedTasks: [],
  });
}

export async function toggleTask(
  userId: string,
  programmeId: string,
  taskId: string,
  currentChecked: string[]
): Promise<string[]> {
  const ref = doc(db, 'users', userId, 'programmeProgress', programmeId);
  const isChecked = currentChecked.includes(taskId);
  const updated = isChecked
    ? currentChecked.filter((id) => id !== taskId)
    : [...currentChecked, taskId];

  await updateDoc(ref, { checkedTasks: updated });
  return updated;
}

export async function resetProgramme(
  userId: string,
  programmeId: string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'programmeProgress', programmeId);
  await setDoc(ref, {
    startedAt: Timestamp.now(),
    checkedTasks: [],
  });
}
