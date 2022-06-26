import React from "react";
import { Modal } from "react-bootstrap";
import {Button} from "react-bootstrap";

export const ConfirmationModal = (props) => {

    return(
        <Modal show = {props.show} onHide={props.handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Are you sure?</Modal.Title>
            </Modal.Header>
            <Modal.Body>You won't be able to undo this action.</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.handleClose}>
                    Close
                </Button>
                <Button name = {props.expenseName} variant="danger" onClick={props.deleteItem}>
                    Proceed
                </Button>
            </Modal.Footer>
        </Modal>
    )
}