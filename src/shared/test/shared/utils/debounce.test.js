import { describe, it, expect, silenced } from "../../miniTest.js";
import { debounce } from '../../../utils/debounce.js';
//Global arrange
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await describe('Debounce function tests', async () => {
    await it('Should group multiple calls but execute only the last one.', async () => {
        //Arrange
        let counter = 0;
        const increment = () => { counter++; };
        const delay = 50;

        const debouncedIncrement = debounce(increment, delay);

        //Act
        debouncedIncrement();
        debouncedIncrement();
        debouncedIncrement(); //Just this call should be executed

        //First check that the debounce time hasn't being over yet
        expect(counter).toBe(0);

        //We give time to the debounce timer to execute increment
        await sleep(delay + 100);

        //Assert
        expect(counter).toBe(1);
    });
    await it('Should pass the right arguments to the original function.', async () => {
        //Arrange
        let receivedArgs = null;
        const saveArgs = (...args) => { receivedArgs = args; };
        const debouncedSave = debounce(saveArgs, 30);

        //Act
        debouncedSave('attempt 1');
        debouncedSave('attempt 2', 'extra data'); //This should be the only saved args

        await sleep(40);

        //Assert
        expect(receivedArgs !== null).toBe(true);
        expect(receivedArgs[0]).toBe('attempt 2');
        expect(receivedArgs[1]).toBe('extra data');
    });
    await it('Should allow a new execution if there has been enough time between requests', async () => {
        //Arrange
        let counter = 0;
        const increment = () => { counter++; };

        const debouncedIncrement = debounce(increment, 30);

        //Act
        debouncedIncrement(); //First attempt
        await sleep(40);    //We let it expire and execute increment=1

        debouncedIncrement(); //Second independend attempt
        await sleep(40);    //Again, we let it expire and execute increment=2

        expect(counter).toBe(2);
    })
});