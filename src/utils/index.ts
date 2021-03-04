export const deepApply = (data: any, changes: any) => {
  Object.keys(changes).forEach((i) => {
    // Replace whole array if size has shrunk
    // All item data needs to be sent in this case
    if (
      Array.isArray(data[i]) &&
      Array.isArray(changes[i]) &&
      changes[i].length < data[i].length
    ) {
      data[i] = changes[i];
      return;
    }

    // Apply nested changes
    if (typeof data[i] === 'object' && typeof changes[i] === 'object') {
      data[i] = deepApply(data[i], changes[i]);
      return;
    }

    data[i] = changes[i];
  });
  return data;
};

export const deepChanges = (initial: any, updated: any) => {
  const isArray = Array.isArray(initial) && Array.isArray(updated);
  const changes = isArray ? [] : ({} as { [key: string]: any });

  Object.keys(updated).forEach((i) => {
    // Return whole array as change if the length changes
    if (
      Array.isArray(initial[i]) &&
      Array.isArray(updated[i]) &&
      updated[i].length < initial[i].length
    ) {
      changes[i] = updated[i];
      return;
    }

    // Get nested changes
    if (typeof initial[i] === 'object' && typeof updated[i] === 'object') {
      changes[i] = deepChanges(initial[i], updated[i]);
      return;
    }

    // Determine actual changes
    if (initial[i] !== updated[i]) {
      changes[i] = updated[i];
    }
  });

  // Discard array changes if no element has changes
  if (isArray && Array.isArray(changes)) {
    let itemsChanged = false;
    changes.forEach((change) => {
      if (Object.keys(change).length > 0) {
        itemsChanged = true;
      }
    });
    if (!itemsChanged) {
      return undefined;
    }
  }
  return changes;
};
