import { addEvent, fetchEvents, updateStatus } from "../services/event.service.js";

export const createNewEvent = async (req, res, next) => {
  try {
    const event = await addEvent({ 
      ...req.body, 
      organizer_id: req.user.userId 
    });
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const events = await fetchEvents();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

export const changeEventStatus = async (req, res, next) => {
  try {
    const { eventId, status } = req.body;
    const event = await updateStatus(eventId, status);
    res.json(event);
  } catch (err) {
    next(err);
  }
};
