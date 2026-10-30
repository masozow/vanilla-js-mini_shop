import { describe, it, expect, silenced } from '../../miniTest.js';
await describe('Testing escape function to prevent XSS', async () => {
    await it('Happy path', async () => {
        //Arrange
        const strings_to_escape = {
            "<p><alert></alert>": "&lt;p&gt;&lt;alert&gt;&lt;/alert&gt;",
            '"': "&quot;",
            "&'": "&amp;&#39;"

        }
        const { esc } = await import('../../../utils/escapeHTML.js');
        //Act
        Object.entries(strings_to_escape).map(([key, value]) => {
            //Assert
            expect(esc(key)).toBe(value);
        });
    });
});