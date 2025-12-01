import { Reflector } from '@nestjs/core';
import { Roles, ROLES_KEY } from './roles.decorator';
import { Role } from '../../../common/enums/role.enum';

describe('Roles Decorator', () => {
  const reflector = new Reflector();

  it('should set metadata with single role', () => {
    @Roles(Role.ADMIN)
    class TestClass {}

    const roles = reflector.get<Role[]>(ROLES_KEY, TestClass);
    expect(roles).toEqual([Role.ADMIN]);
  });

  it('should set metadata with multiple roles', () => {
    @Roles(Role.ADMIN, Role.TRAINER)
    class TestClass {}

    const roles = reflector.get<Role[]>(ROLES_KEY, TestClass);
    expect(roles).toEqual([Role.ADMIN, Role.TRAINER]);
  });

  it('should set metadata with all roles', () => {
    @Roles(Role.ADMIN, Role.TRAINER, Role.USER)
    class TestClass {}

    const roles = reflector.get<Role[]>(ROLES_KEY, TestClass);
    expect(roles).toEqual([Role.ADMIN, Role.TRAINER, Role.USER]);
  });

  it('should set metadata on method', () => {
    class TestClass {
      @Roles(Role.ADMIN)
      testMethod() {
        return;
      }
    }

    const instance = new TestClass();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const roles = reflector.get<Role[]>(ROLES_KEY, instance.testMethod);
    expect(roles).toEqual([Role.ADMIN]);
  });

  it('should export ROLES_KEY constant', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
