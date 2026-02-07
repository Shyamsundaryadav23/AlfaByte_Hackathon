import { createEvent, getAllEvents, updateEventStatus, getEventById } from "../models/event.model.js";

export const addEvent = async (data) => {
  if (!data.title || !data.start_time) {
    throw new Error("Missing required fields");
  }

  return await createEvent(data);
};

export const fetchEvents = async () => {
  return await getAllEvents();
};

export const updateStatus = async (eventId, status) => {
  const event = await getEventById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.status === "Archived") {
    throw new Error("Archived events cannot be modified");
  }

  return await updateEventStatus(eventId, status);
};
