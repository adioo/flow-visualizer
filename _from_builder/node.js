'use strict';

class Node {
    constructor(id, type, label, options) {

        // add the core data
        this.id = id;
        this.label = label;
        this.type = type;
        this.dataAvailable = false;
        this.dataVisible = false;

        // add default options based on type
        switch (type) {
            case 'entrypoint': 
                break
            case 'module':
                break;
            case 'instance':
                this.color = {
                    highlight: {
                        border: '#1A5599',
                        background: '#2070CC'
                    },
                    hover: {
                        border: '#1A5599',
                        background: '#2070CC'
                    }
                };
                break;
            case 'event':
                this.color = {
                    background: '#06D6A0',
                    border: '#05BC8B',
                    hover: {
                        border: '#05BC8B',
                        background: '#07EFB1'
                    },
                    highlight: {
                        border: '#05BC8B',
                        background: '#07EFB1'
                    }
                };
                break;
            case 'emit':
                this.color = {
                    background: '#A2DEF8',
                    border: '#85B6CB',
                    hover: {
                        border: '#85B6CB',
                        background: '#D4F0FB'
                    },
                    highlight: {
                        border: '#85B6CB',
                        background: '#D4F0FB'
                    }
                };
                this.dataAvailable = true;
                this.dataVisible = true;
                break
            case 'dataHandler':
                this.color = {
                    background: '#B7E55B',
                    border: '#A3CC51',
                    hover: {
                        border: '#A3CC51',
                        background: '#CCFF66'
                    },
                    highlight: {
                        border: '#A3CC51',
                        background: '#CCFF66'
                    }
                };
                this.dataAvailable = true;
                this.dataVisible = true;
                break;
            case 'streamHandler':
                this.color = {
                    background: '#F8C5A6',
                    border: '#CBA288',
                    hover: {
                        border: '#CBA288',
                        background: '#F9D4BE'
                    },
                    highlight: {
                        border: '#CBA288',
                        background: '#F9D4BE'
                    }
                };
                this.dataAvailable = true;
                this.dataVisible = true;
                break;
            case 'onceHandler':
                this.color = {
                    background: '#C8C8C8',
                    border: '#51A094',
                    hover: {
                        border: '#51A094',
                        background: '#DEDEDE'
                    },
                    highlight: {
                        border: '#51A094',
                        background: '#DEDEDE'
                    }
                };
                this.dataAvailable = true;
                this.dataVisible = true;
                break;
            case 'errorHandler':
                this.color = {
                    background: '#A10702',
                    border: '#870501',
                    hover: {
                        border: '#870501',
                        background: '#BA0801'
                    },
                    highlight: {
                        border: '#870501',
                        background: '#BA0801'
                    }
                };
                this.font = {
                    color: '#fff'
                };
                break;
            case 'endHandler':
                this.color = {
                    background: '#355691',
                    border: '#2C4877',
                    hover: {
                        border: '#2C4877',
                        background: '#3F66AA'
                    },
                    highlight: {
                        border: '#2C4877',
                        background: '#3F66AA'
                    }
                };
                this.font = {
                    color: '#fff'
                };
                break;
        };

        // add custom options
        if (typeof options === 'object') {
            Object.keys(options).forEach((option) => {
                this[option] = options[option];
            });
        }
    }
}

module.exports = Node;