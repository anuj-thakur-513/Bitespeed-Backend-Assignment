const asyncHandler = require("../utils/asyncHandler");
const prisma = require("../services/prisma");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const handleIdentify = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    throw new ApiError(400, "Enter at least email or phone number");
  }

  // Fetch existing contacts with the provided email or phone number
  const contacts = await prisma.contact.findMany({
    where: {
      OR: [{ email: email }, { phoneNumber: phoneNumber }],
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Fetched contacts: ${contacts}`);

  let primaryContact;
  let response;

  if (contacts.length === 0) {
    // No existing contacts, create a new primary contact
    const createdContact = await prisma.contact.create({
      data: {
        phoneNumber: phoneNumber || null,
        email: email || null,
        linkedId: null,
        linkPrecedence: "Primary",
      },
    });

    response = {
      primaryContactId: createdContact.id,
      emails: [createdContact.email].filter(Boolean),
      phoneNumbers: [createdContact.phoneNumber].filter(Boolean),
      secondaryContactIds: [],
    };
  } else {
    // Identify the primary contact
    primaryContact =
      contacts.find((contact) => contact.linkPrecedence === "Primary") ||
      contacts[0].linkedId;

    if (!isNaN(primaryContact)) {
      primaryContact = await prisma.contact.findFirst({
        where: { id: primaryContact },
      });
    }

    // Check if new information needs to be added as a secondary contact
    const emailExists = contacts.some((contact) => contact.email === email);
    const phoneNumberExists = contacts.some(
      (contact) => contact.phoneNumber === phoneNumber
    );

    let newSecondaryContact = null;

    if ((email && !emailExists) || (phoneNumber && !phoneNumberExists)) {
      newSecondaryContact = await prisma.contact.create({
        data: {
          phoneNumber: phoneNumber || null,
          email: email || null,
          linkedId: primaryContact.id,
          linkPrecedence: "Secondary",
        },
      });
      contacts.push(newSecondaryContact);
    }

    // Merge contacts based on new primary-secondary linking logic
    const emails = new Set();
    const phoneNumbers = new Set();
    const secondaryContactIds = new Set();

    contacts.forEach((contact) => {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      if (contact.linkPrecedence === "Secondary")
        secondaryContactIds.add(contact.id);
    });

    // Determine if a primary contact needs to be updated to secondary
    const conflictingPrimary = contacts.find(
      (contact) =>
        contact.linkPrecedence === "Primary" && contact.id !== primaryContact.id
    );

    if (conflictingPrimary) {
      await prisma.contact.update({
        where: { id: conflictingPrimary.id },
        data: {
          linkPrecedence: "Secondary",
          linkedId: primaryContact.id,
        },
      });

      secondaryContactIds.add(conflictingPrimary.id);
    }

    response = {
      primaryContactId: primaryContact.id,
      emails: Array.from(emails),
      phoneNumbers: Array.from(phoneNumbers),
      secondaryContactIds: Array.from(secondaryContactIds),
    };
  }

  return res.status(200).json(new ApiResponse(response));
});

module.exports = { handleIdentify };
